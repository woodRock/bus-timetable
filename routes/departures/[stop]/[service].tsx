// routes/departures/[stop]/[service].tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import DepartureBoard from "../../../islands/DepartureBoard.tsx";
import Navigation from "../../../components/Navigation.tsx";
import { getDepartureBoard, filterDepartures, Departure } from "../../../utils/metlink.ts";

interface DepartureData {
  stopId: string;
  serviceId: string;
  limit?: number;
  departures: Departure[];
  error?: string;
}

export const handler: Handlers<DepartureData> = {
  async GET(req, ctx) {
    const { stop: stopId, service: serviceId } = ctx.params;
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    
    try {
      const data = await getDepartureBoard(stopId);
      const departures = filterDepartures(data, serviceId, limit);
      
      return ctx.render({
        stopId,
        serviceId,
        limit,
        departures,
      });
    } catch (error) {
      return ctx.render({
        stopId,
        serviceId,
        limit,
        departures: [],
        error: error instanceof Error ? error.message : "Failed to fetch departures",
      });
    }
  },
};

export default function DeparturePage({ data }: PageProps<DepartureData>) {
  const { stopId, serviceId, limit, departures, error } = data;
  
  return (
    <>
      <Head>
        <title>Service {serviceId} at Stop {stopId} | Wellington Bus Timetable</title>
        <meta name="description" content={`Real-time departures for service ${serviceId} at stop ${stopId} in Wellington`} />
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
            
            <h1 class="text-3xl font-bold text-metlink-blue">Wellington Bus Timetable</h1>
            <p class="text-gray-600 mt-2">
              Viewing departures for service {serviceId} at stop {stopId}
            </p>
          </header>
          
          {error && (
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
              <p class="font-bold">Error</p>
              <p>{error}</p>
              <a href="/" class="text-red-700 underline mt-2 inline-block">Try another search</a>
            </div>
          )}
          
          <DepartureBoard
            stopId={stopId}
            serviceId={serviceId}
            limit={limit}
            initialDepartures={departures}
          />
          
          <div class="mt-8 flex justify-between items-center">
            <a 
              href="/" 
              class="inline-flex items-center text-metlink-blue hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Search for a different service
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