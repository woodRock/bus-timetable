// islands/BusStopMap.tsx
// Optimized map with marker clustering and fixed background issue

import { useState, useEffect, useRef } from "preact/hooks";

interface BusStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

interface BusStopMapProps {
  initialStops?: BusStop[];
}

export default function BusStopMap({ initialStops = [] }: BusStopMapProps) {
  const [stops, setStops] = useState<BusStop[]>(initialStops);
  const [loading, setLoading] = useState<boolean>(initialStops.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [showAllStops, setShowAllStops] = useState<boolean>(false);
  const [filteredStops, setFilteredStops] = useState<BusStop[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [devMode, setDevMode] = useState<boolean>(false);
  const [dynamicLoading, setDynamicLoading] = useState<boolean>(true);

  // Load bus stops on mount
  useEffect(() => {
    initMap();
  
    if (initialStops.length === 0) {
      fetchBusStops();
    } else {
      setStops(initialStops);
      fetchBusStops(false);
    }
  
    return () => {
      console.log("Cleaning up map instance...");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Filter stops when search changes
  useEffect(() => {
    if (search) {
      const filtered = stops.filter(stop => 
        stop.stop_id.toLowerCase().includes(search.toLowerCase()) || 
        stop.stop_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStops(filtered.slice(0, 100));
    } else if (showAllStops) {
      setFilteredStops([]);
      updateAllStopsCluster();
    } else {
      setFilteredStops([]);
      resetMap(); // Call a new function to reset the map
    }
  }, [search, showAllStops]);

  // Update markers when filtered stops change from searching
  useEffect(() => {
    if (mapInstanceRef.current && filteredStops.length > 0) {
      updateMapWithFilteredStops();
    }
  }, [filteredStops]);

  // Update the map when stops are loaded
  useEffect(() => {
    if (stops.length > 0 && showAllStops) {
      updateAllStopsCluster();
    }
  }, [stops, showAllStops]);

  // Update markers on map bounds change (for dynamic loading)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !dynamicLoading) return;
  
    function updateVisibleStops() {
      // Only update visible stops if "Show All Stops" is enabled and there’s no active search
      if (!showAllStops || search) return;
  
      const bounds = map.getBounds();
      const visibleStops = stops.filter(stop => {
        return bounds.contains([stop.stop_lat, stop.stop_lon]);
      });
      const limitedStops = visibleStops.slice(0, 300);
      updateMapWithStops(limitedStops);
  
      // Ensure the tile layer is still visible after the update
      if (tileLayerRef.current && !map.hasLayer(tileLayerRef.current)) {
        tileLayerRef.current.addTo(map);
        tileLayerRef.current.redraw();
      }
    }
  
    map.on('moveend', updateVisibleStops);
  
    if (showAllStops && !search) {
      updateVisibleStops();
    }
  
    return () => {
      map.off('moveend', updateVisibleStops);
    };
  }, [mapInstanceRef.current, stops, showAllStops, search, dynamicLoading]);

  // Retry API call when retry count changes
  useEffect(() => {
    if (retryCount > 0) {
      fetchBusStops();
    }
  }, [retryCount]);

  // Fetch bus stops from API
  async function fetchBusStops(showLoadingIndicator = true) {
    if (showLoadingIndicator) {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log("Fetching stops from API...");
      const response = await fetch('/api/stops');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format");
      }
      
      console.log(`Loaded ${data.length} bus stops`);
      setStops(data);
      
      // If "Show All Stops" is enabled, update the map
      if (showAllStops) {
        updateAllStopsCluster();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch bus stops";
      console.error("Error fetching bus stops:", err);
      setError(errorMessage);
    } finally {
      if (showLoadingIndicator) {
        setLoading(false);
      }
    }
  }

  // Initialize Leaflet map
  async function initMap() {
    if (!mapRef.current) return;
  
    try {
      // Check if Leaflet is already loaded
      if (typeof window.L === 'undefined') {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        cssLink.crossOrigin = '';
        document.head.appendChild(cssLink);
  
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        document.head.appendChild(script);
  
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
  
      if (typeof window.L.markerClusterGroup === 'undefined') {
        const markerClusterCss = document.createElement('link');
        markerClusterCss.rel = 'stylesheet';
        markerClusterCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css';
        document.head.appendChild(markerClusterCss);
  
        const markerClusterDefaultCss = document.createElement('link');
        markerClusterDefaultCss.rel = 'stylesheet';
        markerClusterDefaultCss.href = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css';
        document.head.appendChild(markerClusterDefaultCss);
  
        const markerClusterScript = document.createElement('script');
        markerClusterScript.src = 'https://unpkg.com/leaflet.markercluster@1.4.1/dist/leaflet.markercluster.js';
        document.head.appendChild(markerClusterScript);
  
        await new Promise((resolve) => {
          markerClusterScript.onload = resolve;
        });
      }
  
      const map = window.L.map(mapRef.current).setView([-41.2865, 174.7762], 13);
  
      // Add OpenStreetMap tile layer with explicit zIndex
      tileLayerRef.current = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        zIndex: 1, // Ensure the tile layer is at the bottom
      }).addTo(map);
  
      // Ensure other layers have higher z-indexes
      markersLayerRef.current = window.L.layerGroup({ zIndex: 10 }).addTo(map);
      clusterGroupRef.current = window.L.markerClusterGroup({
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        chunkedLoading: true,
        chunkProgress: function(processed, total) {
          console.log(`Loaded ${processed}/${total} markers`);
        },
        zIndex: 15, // Cluster layer above the tile layer
      });
  
      mapInstanceRef.current = map;
  
      if (initialStops.length > 0) {
        setFilteredStops(initialStops.slice(0, 50));
      }
  
      // Force map to re-render
      map.invalidateSize();
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to load map. Please refresh the page.');
    }
  }  

  function resetMap() {
    if (!mapInstanceRef.current) return;
  
    console.log("Resetting map to initial state...");
  
    clearMap();
  
    const isLeafletContainer = mapRef.current?.classList.contains('leaflet-container');
    console.log("Is div a Leaflet container?", isLeafletContainer);
  
    if (!isLeafletContainer || !mapInstanceRef.current) {
      console.log("Reinitializing map because div is not a Leaflet container or map instance is missing...");
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initMap();
      hasReinitializedRef.current = false; // Reset the flag
    }
  
    if (tileLayerRef.current) {
      if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        console.log("Tile layer missing during reset, adding it back...");
        tileLayerRef.current.addTo(mapInstanceRef.current);
      } else {
        console.log("Tile layer is present during reset, forcing redraw...");
        tileLayerRef.current.redraw();
      }
    }
  
    mapInstanceRef.current.setView([-41.2865, 174.7762], 13);
    mapInstanceRef.current.invalidateSize();
  }

  // Clear all markers from the map
  function clearMap() {
    if (!mapInstanceRef.current) return;
  
    // Clear markers layer
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
  
    // Clear cluster group if it exists
    if (clusterGroupRef.current) {
      if (mapInstanceRef.current.hasLayer(clusterGroupRef.current)) {
        mapInstanceRef.current.removeLayer(clusterGroupRef.current);
      }
      clusterGroupRef.current.clearLayers();
    }
  
    // Ensure the tile layer is still present
    if (tileLayerRef.current) {
      if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        console.log("Tile layer missing after clearing map, adding it back...");
        tileLayerRef.current.addTo(mapInstanceRef.current);
      } else {
        console.log("Tile layer is present, forcing redraw...");
        tileLayerRef.current.redraw();
      }
    } else {
      console.log("Tile layer reference is undefined, reinitializing...");
      tileLayerRef.current = window.L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        zIndex: 1,
        subdomains: 'abcd',
      }).addTo(mapInstanceRef.current);
    }
  
    // Force map re-render
    mapInstanceRef.current.invalidateSize();
  }  
  const hasReinitializedRef = useRef(false);

  function updateMapWithFilteredStops() {
    if (!mapRef.current) return;

    console.log("Updating map with filtered stops...");

    const isLeafletContainer = mapRef.current.classList.contains('leaflet-container');
    console.log("Is div a Leaflet container?", isLeafletContainer);

    if (!isLeafletContainer || !mapInstanceRef.current) {
        console.log("Reinitializing map because div is not a Leaflet container or map instance is missing...");
        if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        }
        initMap();
        hasReinitializedRef.current = false; // Reset the flag to allow future reinitializations
    }

    console.log("Proceeding with map update...");

    clearMap();

    if (tileLayerRef.current) {
        if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        console.log("Tile layer missing, adding it back...");
        tileLayerRef.current.addTo(mapInstanceRef.current);
        } else {
        console.log("Tile layer is already on the map, forcing redraw...");
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
        tileLayerRef.current.addTo(mapInstanceRef.current);
        tileLayerRef.current.redraw();
        }

        tileLayerRef.current.on('tileload', () => {
        console.log("Tile loaded successfully");
        });
        tileLayerRef.current.on('tileerror', (error) => {
        console.error("Tile loading error:", error);
        });
    } else {
        console.log("Tile layer reference is undefined, reinitializing...");
        tileLayerRef.current = window.L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        zIndex: 1,
        subdomains: 'abcd',
        }).addTo(mapInstanceRef.current);

        tileLayerRef.current.on('tileload', () => {
        console.log("Tile loaded successfully (reinitialized)");
        });
        tileLayerRef.current.on('tileerror', (error) => {
        console.error("Tile loading error (reinitialized):", error);
        });
    }

    mapInstanceRef.current.invalidateSize();
    updateMapWithStops(filteredStops);
    }

  // Update map with all stops using clustering
  function updateAllStopsCluster() {
    if (!mapInstanceRef.current || !clusterGroupRef.current) return;

    // Clear existing markers
    clearMap();

    // Ensure the tile layer is added to the map
    if (tileLayerRef.current) {
        if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        tileLayerRef.current.addTo(mapInstanceRef.current);
        }
    } else {
        // Reinitialize tile layer if it's undefined
        tileLayerRef.current = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstanceRef.current);
    }

    if (dynamicLoading) {
        // With dynamic loading enabled, we'll add markers based on the current viewport
        const bounds = mapInstanceRef.current.getBounds();
        const visibleStops = stops.filter(stop => 
        bounds.contains([stop.stop_lat, stop.stop_lon])
        ).slice(0, 300);

        updateMapWithStops(visibleStops);
    } else {
        // Create a custom icon for clustered bus stops
        const busStopIcon = window.L.divIcon({
        html: `<div class="bus-stop-marker flex items-center justify-center text-white bg-metlink-blue rounded-full h-5 w-5 border-2 border-white shadow-md text-xs font-bold">B</div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
        });

        // Add all stops to the cluster group
        const chunkSize = 500;
        let processedCount = 0;

        function processChunk() {
        const chunk = stops.slice(processedCount, processedCount + chunkSize);
        processedCount += chunk.length;

        const markers = chunk.map(stop => {
            const marker = window.L.marker([stop.stop_lat, stop.stop_lon], { icon: busStopIcon })
            .bindPopup(`
                <div class="bus-stop-popup">
                <h3 class="font-bold">${stop.stop_name}</h3>
                <p>Stop ID: ${stop.stop_id}</p>
                <a href="/departures/${stop.stop_id}" class="text-metlink-blue hover:underline mt-2 inline-block">
                    View all departures
                </a>
                </div>
            `);

            marker.on('click', () => {
            setSelectedStop(stop);
            });

            return marker;
        });

        // Add markers to cluster group
        clusterGroupRef.current.addLayers(markers);

        // If there are more stops to process, schedule the next chunk
        if (processedCount < stops.length) {
            setTimeout(processChunk, 10); // Small delay to keep UI responsive
        } else {
            // All stops processed, add the cluster group to the map
            mapInstanceRef.current.addLayer(clusterGroupRef.current);
        }
        }

        // Start processing chunks
        processChunk();
    }
  }  
  // Update map with specific stops (used for search results and dynamic loading)
  function updateMapWithStops(stopsToShow: BusStop[]) {
    if (!mapInstanceRef.current) return;
    
    // Clear markers layer
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    
    // Create a custom icon for bus stops
    const busStopIcon = window.L.divIcon({
      html: `<div class="bus-stop-marker flex items-center justify-center text-white bg-metlink-blue rounded-full h-5 w-5 border-2 border-white shadow-md text-xs font-bold">B</div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    // Add markers for each stop
    stopsToShow.forEach(stop => {
      const marker = window.L.marker([stop.stop_lat, stop.stop_lon], { icon: busStopIcon })
        .bindPopup(`
          <div class="bus-stop-popup">
            <h3 class="font-bold">${stop.stop_name}</h3>
            <p>Stop ID: ${stop.stop_id}</p>
            <a href="/departures/${stop.stop_id}" class="text-metlink-blue hover:underline mt-2 inline-block">
              View all departures
            </a>
          </div>
        `);
      
      marker.on('click', () => {
        setSelectedStop(stop);
      });
      
      marker.addTo(markersLayerRef.current);
    });
  }

  // Handle search input change
  function handleSearchChange(e: Event) {
    const target = e.target as HTMLInputElement;
    setSearch(target.value);
  }

  // Handle search form submission
  function handleSearchSubmit(e: Event) {
    e.preventDefault();
    // The filtered stops are already updated via the useEffect
  }

  // Handle selecting a stop from the search results
  function handleSelectStop(stop: BusStop) {
    setSelectedStop(stop);
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([stop.stop_lat, stop.stop_lon], 17);
      
      // Try to find and open the marker popup
      if (markersLayerRef.current) {
        markersLayerRef.current.eachLayer((layer: any) => {
          const latLng = layer.getLatLng();
          if (latLng.lat === stop.stop_lat && latLng.lng === stop.stop_lon) {
            layer.openPopup();
          }
        });
      }
    }
  }

  // Toggle showing all stops
  function toggleShowAllStops() {
    setShowAllStops(!showAllStops);
    setSearch(""); // Clear search when toggling
  }
  
  // Toggle dynamic loading
  function toggleDynamicLoading() {
    setDynamicLoading(!dynamicLoading);
    
    // Update the map with the new setting
    if (!dynamicLoading) {
      // If turning on dynamic loading, clear current stops and load based on viewport
      clearMap();
      if (showAllStops && mapInstanceRef.current) {
        const bounds = mapInstanceRef.current.getBounds();
        const visibleStops = stops.filter(stop => 
          bounds.contains([stop.stop_lat, stop.stop_lon])
        ).slice(0, 300);
        
        updateMapWithStops(visibleStops);
      }
    } else {
      // If turning off dynamic loading, update with clustering
      if (showAllStops) {
        updateAllStopsCluster();
      }
    }
  }

  // Toggle developer mode
  function toggleDevMode() {
    setDevMode(!devMode);
  }

  // Retry loading stops
  function handleRetry() {
    setRetryCount(retryCount + 1);
  }

  return (
    <div class="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="bg-metlink-blue p-4">
        <h2 class="text-xl font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Find Bus Stops
        </h2>
      </div>
      
      <div class="p-4">
        <form onSubmit={handleSearchSubmit} class="mb-4">
          <div class="flex">
            <div class="relative flex-grow">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onInput={handleSearchChange}
                placeholder="Search by stop ID or name"
                class="pl-10 w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-metlink-blue focus:border-metlink-blue"
              />
            </div>
            <button
              type="submit"
              class="px-4 py-2 bg-metlink-green text-black font-medium rounded-r-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-300"
            >
              Search
            </button>
          </div>
        </form>

        <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div class="text-sm text-gray-600">
            {stops.length > 0 ? (
              <>
                <span class="font-medium">{stops.length}</span> total stops available
                {filteredStops.length > 0 && search && (
                  <> • Showing <span class="font-medium">{filteredStops.length}</span> matching stops</>
                )}
              </>
            ) : loading ? (
              "Loading stops..."
            ) : (
              "No stops available"
            )}
          </div>

          <div class="flex gap-2">
            <button
              onClick={toggleShowAllStops}
              class={`text-sm px-3 py-1 rounded-md transition-colors ${
                showAllStops 
                  ? 'bg-metlink-blue text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading || stops.length === 0}
            >
              {showAllStops ? "Hide All Stops" : "Show All Stops"}
            </button>
            
            <button
              onClick={toggleDynamicLoading}
              class={`text-sm px-3 py-1 rounded-md transition-colors ${
                dynamicLoading 
                  ? 'bg-metlink-green text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading || stops.length === 0 || !showAllStops}
              title={dynamicLoading ? "Only stops in the current view are shown" : "All stops are clustered together"}
            >
              {dynamicLoading ? "Dynamic Loading" : "Clustering"}
            </button>
          </div>
        </div>

        {loading && (
          <div class="flex justify-center items-center py-4">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-metlink-blue"></div>
            <span class="ml-2 text-gray-600">Loading stops...</span>
          </div>
        )}

        {error && (
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <div class="flex">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-bold">Error loading bus stops</p>
                <p>{error}</p>
                <div class="mt-2 flex">
                  <button 
                    onClick={handleRetry}
                    class="px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300 transition-colors duration-300 mr-3"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={toggleDevMode}
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-300"
                  >
                    {devMode ? "Hide Details" : "Show Details"}
                  </button>
                </div>
                
                {devMode && (
                  <div class="mt-2 p-2 bg-red-50 text-xs font-mono overflow-x-auto">
                    <p>Status: Error</p>
                    <p>Retry Count: {retryCount}</p>
                    <p>Stops Loaded: {stops.length}</p>
                    <p>API Path: /api/stops</p>
                    <p>Time: {new Date().toISOString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search results list (shows when search has results) */}
        {search && !loading && (
          <div class="mb-4 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            {stops.filter(stop => 
              stop.stop_id.toLowerCase().includes(search.toLowerCase()) || 
              stop.stop_name.toLowerCase().includes(search.toLowerCase())
            ).slice(0, 10).map(stop => (
              <div 
                key={stop.stop_id}
                onClick={() => handleSelectStop(stop)}
                class="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-0"
              >
                <div class="font-medium">{stop.stop_name}</div>
                <div class="text-sm text-gray-600">Stop ID: {stop.stop_id}</div>
              </div>
              ))}
            
              {stops.filter(stop => 
                stop.stop_id.toLowerCase().includes(search.toLowerCase()) || 
                stop.stop_name.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <div class="p-4 text-center text-gray-500">
                  No stops found matching "{search}"
                </div>
              )}
            </div>
          )}
  
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 text-sm text-yellow-700">
            <p class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Performance Tips:</strong> Use search to find specific stops. When "Show All Stops" is enabled, 
                try the "Dynamic Loading" option to only show stops in your current view, or "Clustering" to group nearby stops together.
              </span>
            </p>
          </div>
  
          {/* Map container */}
          <div 
            ref={mapRef}
            class="h-96 rounded-lg border border-gray-300"
            style={{ position: 'relative', zIndex: 0 }} // Ensure proper positioning
            >
            {!mapInstanceRef.current && (
                <div class="flex justify-center items-center h-full">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-metlink-blue"></div>
                <span class="ml-2 text-gray-600">Loading map...</span>
                </div>
            )}
            </div>
  
          {/* Selected stop information */}
          {selectedStop && (
            <div class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 class="font-bold text-lg text-metlink-blue">{selectedStop.stop_name}</h3>
              <p class="mb-2">Stop ID: <span class="font-medium">{selectedStop.stop_id}</span></p>
              
              <div class="flex flex-wrap gap-2 mt-4">
                <a 
                  href={`/departures/${selectedStop.stop_id}`}
                  class="px-4 py-2 bg-metlink-blue text-white rounded hover:bg-metlink-dark-blue transition-colors duration-300 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                  View all departures
                </a>
                
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedStop.stop_lat},${selectedStop.stop_lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors duration-300 inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Add typing for Leaflet library
  declare global {
    interface Window {
      L: any;
    }
  }