// routes/service-alerts.tsx
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { getServiceAlerts, ServiceAlertsResponse } from "../utils/metlink.ts";
import ServiceAlerts from "../islands/ServiceAlerts.tsx";
import Navigation from "../components/Navigation.tsx";

interface ServiceAlertsPageData {
  alerts?: ServiceAlertsResponse;
  error?: string;
}

export const handler: Handlers<ServiceAlertsPageData> = {
  async GET(req, ctx) {
    try {
      const alerts = await getServiceAlerts();
      return ctx.render({ alerts });
    } catch (error) {
      console.error("Error fetching service alerts:", error);
      return ctx.render({ error: error.message });
    }
  },
};

export default function ServiceAlertsPage({ data }: PageProps<ServiceAlertsPageData>) {
  const { alerts, error } = data;

  return (
    <>
      <Head>
        <title>Service Alerts | Wellington Bus Timetable</title>
        <meta name="description" content="Current service alerts and disruptions for Wellington buses and trains" />
      </Head>
      
      <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <Navigation active="alerts" />
        
        <div class="container mx-auto px-4 py-8">
          <header class="mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-metlink-blue">
              Service Alerts
            </h1>
            <p class="text-gray-600 mt-2">
              Current disruptions and service changes for Wellington public transport
            </p>
          </header>
          
          <main>
            {/* Error state */}
            {error && (
              <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
                <div class="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p class="font-bold">Error fetching service alerts</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* No alerts */}
            {!error && (!alerts || !alerts.entity || alerts.entity.length === 0) ? (
              <div class="bg-white p-8 rounded-xl shadow-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-gray-700 text-lg">No service alerts found.</p>
                <p class="text-gray-500 mt-2">All services are operating normally at this time.</p>
              </div>
            ) : (
              <ServiceAlerts alerts={alerts?.entity || []} />
            )}
          </main>
          
          <footer class="mt-12 text-center text-sm text-gray-500">
            <p>Data provided by Metlink Wellington. This is not an official Metlink service.</p>
            <p class="mt-1">Last updated: {new Date().toLocaleString('en-NZ')}</p>
          </footer>
        </div>
      </div>
    </>
  );
}