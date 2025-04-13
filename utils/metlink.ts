// utils/metlink.ts
// Functions to interact with the Metlink API
import { getMetlinkApiKey } from "./env.ts";

/**
 * Interface for departure information
 */
export interface Departure {
  serviceId: string;
  destination: string;
  status: string;
  arrivalTime: string;
  minutesToArrival: number | null;
  displayTime: string;
  wheelchairAccessible: boolean;
}

/**
 * Interface for bus stop information
 */
export interface BusStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

/**
 * Interface for service alert object structure
 */
export interface ServiceAlert {
  id: string;
  alert: {
    active_period?: Array<{
      start?: number;
      end?: number;
    }>;
    effect?: string;
    cause?: string;
    severity_level?: string;
    header_text?: {
      translation?: Array<{
        language?: string;
        text?: string;
      }>;
    };
    description_text?: {
      translation?: Array<{
        language?: string;
        text?: string;
      }>;
    };
    url?: {
      translation?: Array<{
        language?: string;
        text?: string;
      }>;
    };
    informed_entity?: Array<{
      route_id?: string;
      route_type?: number;
      stop_id?: string;
      trip?: {
        trip_id?: string;
        route_id?: number;
        direction_id?: number;
        start_time?: string;
        start_date?: string;
        schedule_relationship?: string;
      };
    }>;
    image?: {
      localized_image?: Array<{
        url?: string;
        media?: string;
      }>;
    };
    image_alternative_text?: {
      translation?: Array<{
        language?: string;
        text?: string;
      }>;
    };
  };
  timestamp?: string;
}

/**
 * Interface for service alerts response
 */
export interface ServiceAlertsResponse {
  header: {
    gtfsRealtimeVersion: string;
    incrementality: number;
    timestamp: number;
  };
  entity: ServiceAlert[];
}

/**
 * Makes an HTTP request to the Metlink API to retrieve departure board data for a stop
 */
export async function getDepartureBoard(stopId: string): Promise<any> {
  const requestUrl = `https://api.opendata.metlink.org.nz/v1/stop-predictions?stop_id=${stopId}`;
  const apiKey = getMetlinkApiKey();
  
  if (!apiKey) {
    console.error("Metlink API key is not set. Please check your .env file.");
  }
  
  const response = await fetch(requestUrl, {
    headers: {
      "x-api-key": apiKey,
      "accept": "application/json"
    }
  });
  
  if (response.status === 200) {
    return await response.json();
  } else if (response.status === 403) {
    throw new Error("Forbidden. Please check your API key.");
  } else {
    throw new Error(`Unknown error: ${response.status}. Please check if stop ID ${stopId} exists.`);
  }
}

/**
 * Makes an HTTP request to the Metlink API to retrieve service alerts
 */
export async function getServiceAlerts(): Promise<ServiceAlertsResponse> {
  const requestUrl = "https://api.opendata.metlink.org.nz/v1/gtfs-rt/servicealerts";
  const apiKey = getMetlinkApiKey();
  
  if (!apiKey) {
    throw new Error("Metlink API key is not set. Please check your .env file.");
  }
  
  const response = await fetch(requestUrl, {
    headers: {
      "x-api-key": apiKey,
      "accept": "application/json"
    }
  });
  
  if (response.status === 200) {
    return await response.json();
  } else if (response.status === 403) {
    throw new Error("Forbidden. Please check your API key.");
  } else {
    throw new Error(`Unknown error: ${response.status}`);
  }
}

/**
 * Makes an HTTP request to the Metlink API to retrieve bus stops
 */
export async function getBusStops(): Promise<BusStop[]> {
  const requestUrl = "https://api.opendata.metlink.org.nz/v1/gtfs/stops";
  const apiKey = getMetlinkApiKey();
  
  if (!apiKey) {
    throw new Error("Metlink API key is not set. Please check your .env file.");
  }
  
  const response = await fetch(requestUrl, {
    headers: {
      "x-api-key": apiKey,
      "accept": "application/json"
    }
  });
  
  if (response.status === 200) {
    const data = await response.json();
    
    // Process and filter stops
    return data
      .filter((stop: any) => 
        // Filter out stops without proper coordinates or IDs
        stop.stop_lat && stop.stop_lon && stop.stop_id
      )
      .map((stop: any) => ({
        stop_id: stop.stop_id,
        stop_name: stop.stop_name,
        stop_lat: parseFloat(stop.stop_lat),
        stop_lon: parseFloat(stop.stop_lon)
      }));
  } else if (response.status === 403) {
    throw new Error("Forbidden. Please check your API key.");
  } else {
    throw new Error(`Unknown error: ${response.status}`);
  }
}

/**
 * Formats the departure information for display
 */
export function formatDeparture(departure: any, serviceId: string): Departure {
  const now = new Date();
  const destination = departure.destination.name;
  
  // Get departure time
  const departureTime = departure.arrival.expected || departure.arrival.aimed;
  
  let displayTime = "";
  let minutesToArrival: number | null = null;
  
  // Handle cancellations
  if (departure.status === "cancelled") {
    displayTime = "CAN";
  } else {
    // Calculate minutes to arrival
    const departureDate = new Date(departureTime);
    minutesToArrival = Math.floor((departureDate.getTime() - now.getTime()) / 60000);
    
    // Format display time
    if (minutesToArrival < 0) {
      displayTime = "Due";
    } else if (minutesToArrival > 60) {
      displayTime = departureDate.toLocaleTimeString('en-NZ', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      displayTime = `${minutesToArrival}min`;
    }
  }
  
  return {
    serviceId,
    destination,
    status: departure.status,
    arrivalTime: departureTime,
    minutesToArrival,
    displayTime,
    wheelchairAccessible: departure.wheelchair_accessible === true
  };
}

/**
 * Filters and formats departures for a specific service
 */
export function filterDepartures(
  data: any, 
  serviceId: string, 
  limit?: number
): Departure[] {
  if (!data || !data.departures || !Array.isArray(data.departures)) {
    console.log("No departures data found in API response");
    return [];
  }
  
  console.log(`Total departures in API response: ${data.departures.length}`);
  console.log(`Filtering for service_id: ${serviceId}`);
  
  // Case-insensitive comparison for service_id
  const filtered = data.departures
    .filter((departure: any) => {
      const departureServiceId = String(departure.service_id);
      const requestedServiceId = String(serviceId);
      
      return departureServiceId.toLowerCase() === requestedServiceId.toLowerCase();
    })
    .map((departure: any) => formatDeparture(departure, serviceId));
  
  console.log(`Found ${filtered.length} departures for service ${serviceId}`);
  
  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Filters alerts by mode of transport
 * @param alerts The list of service alerts
 * @param mode The mode to filter by ('bus', 'train', 'ferry', or 'all')
 */
export function filterAlertsByMode(
  alerts: ServiceAlert[], 
  mode: 'bus' | 'train' | 'ferry' | 'all'
): ServiceAlert[] {
  if (mode === 'all') return alerts;
  
  return alerts.filter(alert => {
    const entities = alert.alert?.informed_entity || [];
    return entities.some(entity => {
      if (mode === 'bus') return entity.route_type === 3;
      if (mode === 'train') return entity.route_type === 2;
      if (mode === 'ferry') return entity.route_type === 4;
      return false;
    });
  });
}

/**
 * Gets a human-readable effect label
 */
export function getEffectLabel(effect: string | undefined): string {
  if (!effect) return 'Update';
  
  switch (effect) {
    case 'DETOUR': return 'Detour';
    case 'STOP_MOVED': return 'Stop Moved';
    case 'OTHER_EFFECT': return 'Service Change';
    case 'MODIFIED_SERVICE': return 'Modified Service';
    case 'NO_SERVICE': return 'No Service';
    case 'REDUCED_SERVICE': return 'Reduced Service';
    case 'SIGNIFICANT_DELAYS': return 'Significant Delays';
    case 'ADDITIONAL_SERVICE': return 'Additional Service';
    default: return effect.replace(/_/g, ' ');
  }
}

/**
 * Formats a timestamp to a human-readable date
 */
export function formatAlertDate(timestamp: number | undefined): string {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-NZ', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  });
}