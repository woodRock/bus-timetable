// routes/index.tsx
// Homepage with form to search for departures and bus stop map

import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import Navigation from "../components/Navigation.tsx";
import BusStopMap from "../islands/BusStopMap.tsx";
import { getBusStops, BusStop } from "../utils/metlink.ts";

interface HomePageData {
  initialStops: BusStop[];
  error?: string;
}

export const handler: Handlers<HomePageData> = {
  async GET(req, ctx) {
    try {
      const stops = await getBusStops();
      const sampleStops = stops.slice(0, 50);
      
      return ctx.render({
        initialStops: sampleStops
      });
    } catch (error) {
      console.error("Error fetching bus stops:", error);
      return ctx.render({
        initialStops: [],
        error: error instanceof Error ? error.message : "Failed to fetch bus stops"
      });
    }
  },
};

export default function Home({ data }: PageProps<HomePageData>) {
  const { initialStops, error } = data;
  
  return (
    <>
      <Head>
        <title>Wellington Bus Timetable</title>
        <meta name="description" content="Check real-time departures for Wellington buses" />
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <Navigation active="home" />
        
        <div class="container mx-auto px-4 py-8">
          <header class="mb-10 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-metlink-blue mt-10 mb-2">
              Wellington Bus Timetable
            </h1>
            <p class="text-lg text-gray-600">
              Real-time departures for Wellington, New Zealand
            </p>
          </header>
          
          {/* Moved "How to use" Instructions to the Top */}
          <div class="mb-8">
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-metlink-green mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-800">How to use</h2>
              </div>
              <ol class="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Find your bus stop number on the map below</li>
                <li>Enter the stop number in the search form</li>
                <li>Enter the service number you want to check</li>
                <li>Click "View Departures" to see real-time arrival information</li>
              </ol>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Search Form */}
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="bg-metlink-blue p-6">
                <h2 class="text-2xl font-bold text-white flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Search Departures
                </h2>
              </div>
              
              <form action="/departures" method="get" class="p-6 space-y-6">
                <div>
                  <label for="stop" class="block text-sm font-medium text-gray-700 mb-1">
                    Stop ID
                  </label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="stop"
                      name="stop"
                      required
                      placeholder="e.g. 5000"
                      class="pl-10 w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metlink-blue focus:border-metlink-blue"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    The 4-digit code displayed at your bus stop
                  </p>
                </div>
                
                <div>
                  <label for="service" class="block text-sm font-medium text-gray-700 mb-1">
                    Service ID
                  </label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="service"
                      name="service"
                      required
                      placeholder="e.g. 1"
                      class="pl-10 w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metlink-blue focus:border-metlink-blue"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    The bus service number you want to check
                  </p>
                </div>
                
                <div>
                  <label for="limit" class="block text-sm font-medium text-gray-700 mb-1">
                    Limit Results (optional)
                  </label>
                  <div class="relative rounded-md shadow-sm">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      id="limit"
                      name="limit"
                      min="1"
                      max="20"
                      placeholder="e.g. 5"
                      class="pl-10 w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-metlink-blue focus:border-metlink-blue"
                    />
                  </div>
                  <p class="mt-1 text-xs text-gray-500">
                    Maximum number of departures to display
                  </p>
                </div>
                
                <button
                  type="submit"
                  class="w-full flex justify-center items-center px-6 py-3 text-black bg-metlink-green rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  View Departures
                </button>
              </form>
              
              <div class="px-6 pb-6">
                <div class="flex justify-center">
                  <a 
                    href="/service-alerts" 
                    class="inline-flex items-center px-4 py-2 bg-blue-100 text-metlink-blue rounded-md hover:bg-blue-200 transition-colors duration-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    View Service Alerts
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bus Stop Map */}
          <BusStopMap initialStops={initialStops} />
          
          {/* Show error if present */}
          {error && (
            <div class="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
              <p class="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* About Section (already at the bottom) */}
          <div class="mt-12">
            <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-metlink-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 class="text-xl font-semibold text-gray-800">About this app</h2>
              </div>
              <p class="text-gray-700 leading-relaxed">
                This application displays real-time bus departure information for Wellington, New Zealand, 
                using data from the Metlink API. Enter a stop ID and service number to see when your bus will arrive.
              </p>
              <div class="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div class="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm text-blue-700">
                    This is not an official Metlink service. The app uses the public Metlink API to provide real-time information.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <footer class="mt-12 text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
            <p>Data provided by Metlink Wellington. This is not an official Metlink service.</p>
            <p class="mt-1">Last updated: {new Date().toLocaleString('en-NZ')}</p>
          </footer>
        </div>
      </div>
    </>
  );
}