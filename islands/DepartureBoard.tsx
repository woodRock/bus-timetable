// islands/DepartureBoard.tsx
// Modified interactive component for displaying real-time departure information

import { useEffect, useState } from "preact/hooks";
import { Departure } from "../utils/metlink.ts";
import DepartureRow from "../components/DepartureRow.tsx";

interface DepartureBoardProps {
  stopId: string;
  serviceId: string;
  limit?: number;
  initialDepartures: Departure[];
  hideTitle?: boolean;
}

export default function DepartureBoard({ 
  stopId, 
  serviceId, 
  limit, 
  initialDepartures,
  hideTitle = false
}: DepartureBoardProps) {
  const [departures, setDepartures] = useState<Departure[]>(
    // Update initial departures with calculated values
    initialDepartures.map(processDeparture)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [countDown, setCountDown] = useState<number>(30);
  
  // Function to calculate minutes to arrival and display time
  function processDeparture(departure: Departure): Departure {
    const now = new Date();
    let displayTime = "";
    let minutesToArrival: number | null = null;
    
    // Handle cancellations
    if (departure.status === "cancelled") {
      displayTime = "CAN";
    } else if (departure.arrivalTime) {
      // Calculate minutes to arrival
      const departureDate = new Date(departure.arrivalTime);
      minutesToArrival = Math.floor((departureDate.getTime() - now.getTime()) / 60000);
      
      // Format display time
      if (minutesToArrival < 0) {
        displayTime = "Due";
      } else if (minutesToArrival > 60) {
        displayTime = departureDate.toLocaleTimeString('en-NZ', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        displayTime = `${minutesToArrival}min`;
      }
    }
    
    return {
      ...departure,
      minutesToArrival,
      displayTime
    };
  }
  
  // Function to refresh departure data
  async function refreshDepartures() {
    setLoading(true);
    setError(null);
    setCountDown(30);
    
    try {
      const limitParam = limit ? `&limit=${limit}` : '';
      const response = await fetch(`/api/departures?stop=${stopId}&service=${serviceId}${limitParam}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Process each departure to calculate minutes to arrival and display time
        const processedDepartures = data.map(processDeparture);
        setDepartures(processedDepartures);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Invalid response format from API");
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch departures");
    } finally {
      setLoading(false);
    }
  }
  
  // Update countDown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown((prev) => (prev > 0 ? prev - 1 : 0));
      
      // Also update the calculated values every second
      setDepartures(prev => prev.map(processDeparture));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Refresh data every 30 seconds
  useEffect(() => {
    if (countDown === 0) {
      refreshDepartures();
    }
  }, [countDown]);
  
  // Initial fetch when component mounts (if needed)
  useEffect(() => {
    // Only fetch if no initial departures were provided
    if (initialDepartures.length === 0) {
      refreshDepartures();
    }
    
    // Set up interval for refreshing
    const interval = setInterval(refreshDepartures, 30000);
    return () => clearInterval(interval);
  }, [stopId, serviceId, limit]);
  
  return (
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      {!hideTitle && (
        <div class="bg-metlink-blue p-4 flex justify-between items-center">
          <h2 class="text-xl md:text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Service {serviceId} departures from stop {stopId}
          </h2>
          <button
            onClick={refreshDepartures}
            disabled={loading}
            class="px-4 py-2 bg-metlink-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      )}
      
      {error && (
        <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
          <div class="flex">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div class="p-4">
        {departures.length === 0 ? (
          <div class="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-700 text-lg">No departures found for this service.</p>
            <p class="text-gray-500 mt-2">Try checking another service or stop.</p>
          </div>
        ) : (
          <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded-lg overflow-hidden">
              <thead>
                <tr class="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                  <th class="py-3 px-6 text-left">Service</th>
                  <th class="py-3 px-6 text-left">Destination</th>
                  <th class="py-3 px-6 text-left">Departure</th>
                  <th class="py-3 px-6 text-center">Accessibility</th>
                </tr>
              </thead>
              <tbody class="text-gray-700">
                {departures.map((departure, i) => (
                  <DepartureRow key={i} departure={departure} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>
            Last updated: <span class="font-medium">{lastUpdated}</span>
          </div>
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Refreshing in <span class="font-medium">{countDown}</span> seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}