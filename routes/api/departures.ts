// routes/api/departures.ts
// API endpoint to fetch departure information

import { HandlerContext } from "$fresh/server.ts";
import { getDepartureBoard, filterDepartures } from "../../utils/metlink.ts";

export const handler = async (req: Request, _ctx: HandlerContext): Response => {
  // Parse URL and query parameters
  const url = new URL(req.url);
  const stopId = url.searchParams.get("stopId");
  const serviceId = url.searchParams.get("serviceId");
  const limitParam = url.searchParams.get("limit");
  
  // Validate required parameters
  if (!stopId || !serviceId) {
    return new Response(
      JSON.stringify({ error: "stopId and serviceId are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Parse limit parameter if provided
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  
  try {
    // Fetch departure board data from Metlink API
    const data = await getDepartureBoard(stopId);
    
    // Filter and format departures for the requested service
    const departures = filterDepartures(data, serviceId, limit);
    
    // Return the departure data
    return new Response(
      JSON.stringify(departures),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};