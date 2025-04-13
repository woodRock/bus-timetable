// components/DepartureRow.tsx
// Component for displaying a single departure in the table

import { Departure } from "../utils/metlink.ts";

export default function DepartureRow({ departure }: { departure: Departure }) {
  // Status color classes
  const getStatusClasses = (status: string): string => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "delayed":
        return "bg-amber-100 text-amber-800";
      case "onTime":
      case "early":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <tr class="border-b hover:bg-gray-50 transition-colors duration-150">
      <td class="py-3 px-6 text-left">
        <span class="font-medium text-metlink-blue">{departure.serviceId}</span>
      </td>
      <td class="py-3 px-6 text-left">
        {departure.destination}
      </td>
      <td class="py-3 px-6 text-left">
        <div class="flex items-center">
          <span class={`px-2 py-1 text-xs rounded ${getStatusClasses(departure.status)}`}>
            {departure.status === "cancelled" ? "Cancelled" : departure.displayTime}
          </span>
        </div>
      </td>
      <td class="py-3 px-6 text-center">
        {departure.wheelchairAccessible ? (
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            <span class="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14a7 7 0 01-7 7m7-7a7 7 0 00-7-7m7 7H3m7 7a7 7 0 01-7-7m7 7a7 7 0 007-7m-7 7v-7m0 7V3" />
              </svg>
              Accessible
            </span>
          </span>
        ) : (
          <span class="text-gray-400 text-xs">Not specified</span>
        )}
      </td>
    </tr>
  );
}