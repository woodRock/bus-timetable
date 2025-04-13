// routes/departures/[stop].tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getDepartureBoard, Departure } from "../../utils/metlink.ts";
import DepartureBoard from "../../islands/DepartureBoard.tsx";
import Navigation from "../../components/Navigation.tsx";

interface StopDepartureData {
  stopId: string;
  departures: Departure[];
  groupedDepartures: Record<string, Departure[]>;
  error?: string;
}

export const handler: Handlers<StopDepartureData> = {
  async GET(req, ctx) {
    const { stop: stopId } = ctx.params;
    
    try {
      const data = await getDepartureBoard(stopId);
      
      if (!data || !data.departures || !Array.isArray(data.departures)) {
        return ctx.render({
          stopId,
          departures: [],
          groupedDepartures: {},
          error: "No departures found for this stop"
        });
      }
      
      // Process all departures for this stop
      const departures: Departure[] = data.departures.map((departure: any) => {
        const serviceId = departure.service_id.toString();
        return {
          serviceId,
          destination: departure.destination?.name || "Unknown",
          status: departure.status || "scheduled",
          arrivalTime: departure.arrival?.expected || departure.arrival?.aimed || "",
          minutesToArrival: null, // Will be calculated in the component
          displayTime: "", // Will be calculated in the component
          wheelchairAccessible: departure.wheelchair_accessible === true
        };
      });
      
      // Group departures by service ID
      const groupedDepartures: Record<string, Departure[]> = {};
      departures.forEach(departure => {
        if (!groupedDepartures[departure.serviceId]) {
          groupedDepartures[departure.serviceId] = [];
        }
        groupedDepartures[departure.serviceId].push(departure);
      });
      
      // Sort departures within each group
      Object.keys(groupedDepartures).forEach(serviceId => {
        groupedDepartures[serviceId].sort((a, b) => {
          const timeA = new Date(a.arrivalTime).getTime();
          const timeB = new Date(b.arrivalTime).getTime();
          return timeA - timeB;
        });
      });
      
      return ctx.render({
        stopId,
        departures,
        groupedDepartures
      });
    } catch (error) {
      return ctx.render({
        stopId,
        departures: [],
        groupedDepartures: {},
        error: error instanceof Error ? error.message : "Failed to fetch departures"
      });
    }
  },
};

export default function StopDeparturePage({ data }: PageProps<StopDepartureData>) {
  const { stopId, departures, groupedDepartures, error } = data;
  const serviceIds = Object.keys(groupedDepartures).sort((a, b) => {
    // Try to sort numeric service IDs correctly
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    // Fall back to string comparison
    return a.localeCompare(b);
  });
  
  return (
    <>
      <Head>
        <title>Departures for Stop {stopId} | Wellington Bus Timetable</title>
        <meta name="description" content={`Real-time departures for stop ${stopId} in Wellington`} />
      </Head>
      
      <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <Navigation active="departures" />
        
        <div class="container mx-auto px-4 py-8">
          <header class="mb-8">
            <div class="mb-6 flex items-center">
              <a href="/" class="flex items-center text-metlink-blue hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to search
              </a>
            </div>
            
            <h1 class="text-3xl font-bold text-metlink-blue">All departures for stop {stopId}</h1>
            <p class="text-gray-600 mt-2">
              {departures.length} departures across {serviceIds.length} services
            </p>
          </header>
          
          {error && (
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
              <p class="font-bold">Error</p>
              <p>{error}</p>
              <a href="/" class="text-red-700 underline mt-2 inline-block">Try another search</a>
            </div>
          )}
          
          {!error && serviceIds.length === 0 && (
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-700 text-lg">No departures found for this stop.</p>
              <p class="text-gray-500 mt-2">This could be due to the time of day or service disruptions.</p>
              <a href="/" class="mt-4 inline-flex items-center px-4 py-2 bg-metlink-blue text-white rounded-md hover:bg-metlink-dark-blue transition-colors duration-300">
                Search for another stop
              </a>
            </div>
          )}
          
          {/* Display all services with departures */}
          {serviceIds.map(serviceId => (
            <div key={serviceId} class="mb-6">
              <h2 class="text-xl font-semibold mb-3 flex items-center">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-metlink-blue text-white rounded-full mr-2 text-sm font-bold">
                  {serviceId}
                </span>
                Service {serviceId} departures
              </h2>
              <DepartureBoard
                stopId={stopId}
                serviceId={serviceId}
                initialDepartures={groupedDepartures[serviceId]}
                hideTitle={true}
              />
            </div>
          ))}
          
          <div class="mt-8 flex justify-between items-center">
            <a 
              href="/" 
              class="inline-flex items-center text-metlink-blue hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Search for a different stop
            </a>
            
            <a 
              href="/service-alerts" 
              class="inline-flex items-center text-metlink-blue hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              View service alerts
            </a>
          </div>
          
          <footer class="mt-12 text-sm text-gray-500 text-center border-t border-gray-200 pt-6">
            <p>Data provided by Metlink Wellington. This is not an official Metlink service.</p>
          </footer>
        </div>
      </div>
    </>
  );
}