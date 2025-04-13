// routes/api/alerts.ts
// API endpoint for fetching service alerts

import { Handlers } from "$fresh/server.ts";
import { getServiceAlerts } from "../../utils/metlink.ts";

export const handler: Handlers = {
  async GET(req) {
    try {
      const alerts = await getServiceAlerts();
      return new Response(JSON.stringify(alerts), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error fetching service alerts:", error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch alerts" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  },
};