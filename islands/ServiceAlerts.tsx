// islands/ServiceAlerts.tsx
import { useState } from "preact/hooks";
import type { ServiceAlert } from "../utils/metlink.ts";
import { getEffectLabel, formatAlertDate } from "../utils/metlink.ts";

interface ServiceAlertsProps {
  alerts: ServiceAlert[];
}

export default function ServiceAlerts({ alerts }: ServiceAlertsProps) {
  const [filter, setFilter] = useState("all");
  
  // Filter alerts based on selected mode
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => {
        const entities = alert.alert?.informed_entity || [];
        return entities.some(entity => {
          if (filter === 'bus') return entity.route_type === 3;
          if (filter === 'train') return entity.route_type === 2;
          if (filter === 'ferry') return entity.route_type === 4;
          return false;
        });
      });

  // Get badge color based on severity or effect
  const getBadgeColor = (alert: ServiceAlert) => {
    const severity = alert.alert?.severity_level;
    const effect = alert.alert?.effect;
    
    if (severity === 'WARNING') return 'bg-amber-100 text-amber-800';
    if (severity === 'INFO') return 'bg-blue-100 text-blue-800';
    if (severity === 'SEVERE') return 'bg-red-100 text-red-800';
    
    // Fallback based on effect
    if (effect === 'DETOUR') return 'bg-orange-100 text-orange-800';
    if (effect === 'STOP_MOVED') return 'bg-purple-100 text-purple-800';
    if (effect === 'OTHER_EFFECT') return 'bg-gray-100 text-gray-800';
    if (effect === 'MODIFIED_SERVICE') return 'bg-teal-100 text-teal-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  // Determine if an alert affects trains
  const affectsTrain = (alert: ServiceAlert) => {
    const entities = alert.alert?.informed_entity || [];
    return entities.some(entity => entity.route_type === 2);
  };

  // Determine if an alert affects buses
  const affectsBus = (alert: ServiceAlert) => {
    const entities = alert.alert?.informed_entity || [];
    return entities.some(entity => entity.route_type === 3);
  };

  // Determine if an alert affects ferries
  const affectsFerry = (alert: ServiceAlert) => {
    const entities = alert.alert?.informed_entity || [];
    return entities.some(entity => entity.route_type === 4);
  };

  return (
    <div>
      {/* Filter controls */}
      <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
        <h2 class="text-lg font-semibold mb-3">Filter Service Alerts</h2>
        <div class="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')}
            class={`px-4 py-2 rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-metlink-blue text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            All Alerts
          </button>
          <button 
            onClick={() => setFilter('bus')}
            class={`px-4 py-2 rounded-md transition-colors ${
              filter === 'bus' 
                ? 'bg-metlink-blue text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Bus Only
          </button>
          <button 
            onClick={() => setFilter('train')}
            class={`px-4 py-2 rounded-md transition-colors ${
              filter === 'train' 
                ? 'bg-metlink-blue text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Train Only
          </button>
          <button 
            onClick={() => setFilter('ferry')}
            class={`px-4 py-2 rounded-md transition-colors ${
              filter === 'ferry' 
                ? 'bg-metlink-blue text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Ferry Only
          </button>
        </div>
      </div>
      
      {/* Alert count */}
      <div class="mb-4">
        <p class="text-gray-600">
          Showing {filteredAlerts.length} {filter !== 'all' ? `${filter} ` : ''}alerts
        </p>
      </div>
      
      {/* Alerts list */}
      {filteredAlerts.length > 0 ? (
        <div class="space-y-6">
          {filteredAlerts.map((item) => {
            const alert = item.alert;
            const header = alert?.header_text?.translation?.[0]?.text || 'No title provided';
            const description = alert?.description_text?.translation?.[0]?.text || '';
            const startDate = alert?.active_period?.[0]?.start;
            const endDate = alert?.active_period?.[0]?.end;
            const effect = alert?.effect;
            
            return (
              <div key={item.id} class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="flex items-start p-4 md:p-6">
                  {/* Mode indicators */}
                  <div class="mr-4 flex flex-col gap-1 mt-1">
                    {affectsBus(item) && (
                      <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-yellow-500">
                        <span class="text-black text-xs font-bold">B</span>
                      </span>
                    )}
                    {affectsTrain(item) && (
                      <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-600">
                        <span class="text-black text-xs font-bold">T</span>
                      </span>
                    )}
                    {affectsFerry(item) && (
                      <span class="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500">
                        <span class="text-black text-xs font-bold">F</span>
                      </span>
                    )}
                  </div>
                  
                  <div class="flex-1">
                    {/* Alert header */}
                    <h3 class="text-xl font-bold text-metlink-blue">{header}</h3>
                    
                    {/* Alert metadata */}
                    <div class="flex flex-wrap gap-2 mt-3 mb-4">
                      <span class={`text-xs px-2 py-1 rounded ${getBadgeColor(item)}`}>
                        {getEffectLabel(effect)}
                      </span>
                      {startDate && (
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                          From: {formatAlertDate(startDate)}
                        </span>
                      )}
                      {endDate && (
                        <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800">
                          Until: {formatAlertDate(endDate)}
                        </span>
                      )}
                    </div>
                    
                    {/* Alert description */}
                    {description && (
                      <div class="mt-3 text-gray-700 whitespace-pre-line">
                        <p>{description}</p>
                      </div>
                    )}
                    
                    {/* Alert URL if available */}
                    {alert?.url?.translation?.[0]?.text && (
                      <div class="mt-4">
                        <a 
                          href={alert.url.translation[0].text} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="text-metlink-blue hover:underline flex items-center text-sm font-medium"
                        >
                          More information
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
                    
                    {/* Alert image if available */}
                    {alert?.image?.localized_image && alert.image.localized_image.length > 0 && (
                      <div class="mt-4">
                        <img 
                          src={alert.image.localized_image[0].url} 
                          alt={alert?.image_alternative_text?.translation?.[0]?.text || "Alert image"} 
                          class="max-w-full h-auto rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="bg-white p-8 rounded-xl shadow-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-700 text-lg">No service alerts found for the selected filter.</p>
          <p class="text-gray-500 mt-2">Try selecting a different mode of transport.</p>
        </div>
      )}
    </div>
  );
}