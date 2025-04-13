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