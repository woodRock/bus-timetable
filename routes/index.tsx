// routes/index.tsx
// Homepage with form to search for departures

import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Wellington Bus Timetable</title>
        <meta name="description" content="Check real-time departures for Wellington buses" />
      </Head>
      <div class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div class="container mx-auto px-4 py-8">
          <header class="mb-10 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-metlink-blue mt-10 mb-2">
              Wellington Bus Timetable
            </h1>
            <p class="text-lg text-gray-600">
              Real-time departures for Wellington, New Zealand
            </p>
          </header>
          
          <div class="max-w-2xl mx-auto">
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            
            <div class="mt-12 bg-white rounded-xl shadow-lg p-6">
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
        </div>
      </div>
    </>
  );
}