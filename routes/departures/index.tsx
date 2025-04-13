// routes/departures/index.tsx
// Handler to redirect from form submission to the correct route

import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  GET(req) {
    const url = new URL(req.url);
    const stop = url.searchParams.get("stop");
    const service = url.searchParams.get("service");
    const limit = url.searchParams.get("limit");
    
    if (!stop || !service) {
      return new Response("Missing required parameters", { status: 400 });
    }
    
    // Build the redirect URL
    let redirectUrl = `/departures/${stop}/${service}`;
    if (limit) {
      redirectUrl += `?limit=${limit}`;
    }
    
    return new Response(null, {
      status: 307,
      headers: { Location: redirectUrl },
    });
  },
};