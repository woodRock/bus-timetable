// islands/DepartureBoard.tsx";
import DepartureBoard from "../../../islands/DepartureBoard.tsx";
import { getDepartureBoard, filterDepartures } from "../../../utils/metlink.ts";

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
      <head>
        <title>Service {serviceId} at Stop {stopId} | Wellington Bus Timetable</title>
        <meta name="description" content={`Real-time departures for service ${serviceId} at stop ${stopId} in Wellington`} />
      </head>
      
      <div class="p-4 mx-auto max-w-screen-md">
        <header class="mb-8">
          <a href="/" class="text-blue-600 hover:underline mb-2 inline-block">&larr; Back to search</a>
          <h1 class="text-3xl font-bold">Wellington Bus Timetable</h1>
        </header>
        
        {error && (
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p class="font-bold">Error</p>
            <p>{error}</p>
            <a href="/" class="text-red-700 underline">Try another search</a>
          </div>
        )}
        
        <DepartureBoard
          stopId={stopId}
          serviceId={serviceId}
          limit={limit}
          initialDepartures={departures}
        />
        
        <footer class="mt-12 text-sm text-gray-500">
          <p>Data provided by Metlink Wellington. This is not an official Metlink service.</p>
        </footer>
      </div>
    </>
  );
}