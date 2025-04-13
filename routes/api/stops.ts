// routes/api/stops.ts
// Improved API endpoint for fetching bus stops with better error handling

import { Handlers } from "$fresh/server.ts";
import { getMetlinkApiKey } from "../../utils/env.ts";

// Define cached stops to avoid frequent API calls
let cachedStops: any[] = [];
let lastFetched: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const forceRefresh = url.searchParams.get("refresh") === "true";
      
      // Check if we have recently cached stops and not forcing refresh
      const now = Date.now();
      if (!forceRefresh && cachedStops.length > 0 && now - lastFetched < CACHE_DURATION) {
        console.log(`Returning ${cachedStops.length} stops from cache`);
        return new Response(JSON.stringify(cachedStops), {
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Get API key
      const apiKey = getMetlinkApiKey();
      
      // Validate API key
      if (!apiKey) {
        console.error("API key is missing");
        return new Response(
          JSON.stringify({ error: "API key is not configured" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Fetch stops from Metlink API
      console.log("Fetching stops from Metlink API...");
      const requestUrl = "https://api.opendata.metlink.org.nz/v1/gtfs/stops";
      
      console.log(`Making request to: ${requestUrl}`);
      
      // Use a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const response = await fetch(requestUrl, {
          headers: {
            "x-api-key": apiKey,
            "accept": "application/json"
          },
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        console.log(`API response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 403) {
            console.error("API key unauthorized");
            return new Response(
              JSON.stringify({ error: "API key unauthorized. Please check your Metlink API key." }),
              {
                status: 403,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
          
          // Try to get error details from response
          let errorDetails = "";
          try {
            const errorText = await response.text();
            errorDetails = errorText;
          } catch (e) {
            errorDetails = "Could not extract error details";
          }
          
          console.error(`Error fetching stops: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
          return new Response(
            JSON.stringify({ 
              error: `Error fetching stops: ${response.status} ${response.statusText}`,
              details: errorDetails
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        
        // Get the response data
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data);
          return new Response(
            JSON.stringify({ 
              error: "Invalid response format from Metlink API",
              details: JSON.stringify(data).substring(0, 200) + "..." // First 200 chars for debugging
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        
        console.log(`Raw API response contains ${data.length} items`);
        
        // Process and filter stops
        const processedStops = data
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
        
        console.log(`After filtering, there are ${processedStops.length} valid stops`);
        
        // Update cache
        cachedStops = processedStops;
        lastFetched = now;
        
        return new Response(JSON.stringify(processedStops), {
          headers: { "Content-Type": "application/json" },
        });
        
      } catch (fetchError) {
        // Clear the timeout if there's an error
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          console.error("Request timed out");
          return new Response(
            JSON.stringify({ error: "Request to Metlink API timed out" }),
            {
              status: 504, // Gateway Timeout
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        
        // Re-throw for the outer catch block
        throw fetchError;
      }
      
    } catch (error) {
      console.error("Error in bus stops API handler:", error);
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Failed to fetch bus stops",
          stack: error instanceof Error ? error.stack : undefined
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};