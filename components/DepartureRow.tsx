// components/DepartureRow.tsx
// Component to display an individual departure

import { JSX } from "preact";
import { Departure } from "../utils/metlink.ts";

export default function DepartureRow({ departure }: { departure: Departure }): JSX.Element {
  // Helper function to determine row style based on status
  const getRowStyle = () => {
    if (departure.status === "cancelled") {
      return "bg-red-50 hover:bg-red-100";
    } 
    
    // Highlight imminent departures
    if (departure.minutesToArrival !== null) {
      if (departure.minutesToArrival <= 5) {
        return "bg-green-50 hover:bg-green-100";
      }
    }
    
    return "hover:bg-blue-50";
  };
  
  // Helper function to determine time display style
  const getTimeStyle = () => {
    if (departure.status === "cancelled") {
      return "inline-block py-1 px-3 bg-red-100 text-red-700 rounded-full font-medium";
    }
    
    if (departure.displayTime === "Due") {
      return "inline-block py-1 px-3 bg-green-100 text-green-700 rounded-full font-medium";
    }
    
    if (departure.minutesToArrival !== null && departure.minutesToArrival <= 10) {
      return "inline-block py-1 px-3 bg-blue-100 text-blue-700 rounded-full font-medium";
    }
    
    return "font-medium";
  };
  
  return (
    <tr class={`transition-colors duration-200 ${getRowStyle()}`}>
      <td class="py-3 px-6 border-b">
        <span class="bg-black text-white rounded-md py-1 px-3 text-sm font-bold shadow-sm">
          {departure.serviceId}
        </span>
      </td>
      <td class="py-3 px-6 border-b">
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {departure.destination}
        </div>
      </td>
      <td class="py-3 px-6 border-b">
        <span class={getTimeStyle()}>
          {departure.status === "cancelled" ? "Cancelled" : departure.displayTime}
        </span>
      </td>
      <td class="py-3 px-6 border-b text-center">
        {departure.wheelchairAccessible ? (
          <span 
            title="Wheelchair Accessible" 
            aria-label="Wheelchair Accessible"
            class="text-xl"
          >
            ♿
          </span>
        ) : (
          <span class="text-gray-400 text-sm">—</span>
        )}
      </td>
    </tr>
  );
}