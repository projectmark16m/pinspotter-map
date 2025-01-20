import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MapViewProps {
  className?: string;
  markers: Array<{
    id: string;
    address: string;
    coordinates: [number, number];
    details?: string;
  }>;
}

const MapView: React.FC<MapViewProps> = ({ className, markers }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [token, setToken] = useState(localStorage.getItem('mapbox_token') || '');
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const initializeMap = async () => {
    if (!mapContainer.current || !token.trim()) {
      toast.error("Please enter a valid Mapbox token");
      return;
    }

    try {
      // Clean up existing map if it exists
      if (map.current) {
        map.current.remove();
      }

      // Test token validity before initializing
      const testResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`
      );
      
      if (!testResponse.ok) {
        throw new Error('Invalid token');
      }

      mapboxgl.accessToken = token;
      localStorage.setItem('mapbox_token', token);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      setIsMapInitialized(true);
      toast.success("Map initialized successfully");
    } catch (error) {
      console.error("Map initialization error:", error);
      localStorage.removeItem('mapbox_token'); // Clear invalid token
      toast.error("Invalid Mapbox token. Please check your token and try again.");
    }
  };

  useEffect(() => {
    if (token && !isMapInitialized) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [token]);

  useEffect(() => {
    if (!map.current || !isMapInitialized) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach((location) => {
      const el = document.createElement("div");
      el.className = "w-6 h-6 bg-map-pin rounded-full cursor-pointer transform-gpu transition-transform duration-200 hover:scale-110";

      const marker = new mapboxgl.Marker(el)
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25, className: "!bg-white/90 backdrop-blur" })
            .setHTML(`
              <div class="p-2 min-w-[200px]">
                <h3 class="font-medium text-gray-900">${location.address}</h3>
                ${location.details ? `<p class="mt-1 text-sm text-gray-600">${location.details}</p>` : ""}
              </div>
            `)
        )
        .addTo(map.current);

      markersRef.current[location.id] = marker;
    });

    // Fit bounds to show all markers
    if (markers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach((location) => {
        bounds.extend(location.coordinates);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [markers, isMapInitialized]);

  if (!isMapInitialized) {
    return (
      <div className="p-4 bg-white/80 backdrop-blur rounded-lg shadow-sm ring-1 ring-black/5">
        <h3 className="text-lg font-medium mb-4">Enter your Mapbox Token</h3>
        <p className="text-sm text-gray-600 mb-4">
          To use this map, you need to provide your Mapbox public token. You can find it in your Mapbox account dashboard at{" "}
          <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            mapbox.com
          </a>
        </p>
        <div className="flex gap-2">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="pk.eyJ1..."
            className="flex-1"
          />
          <Button onClick={initializeMap}>Initialize Map</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full min-h-[400px]", className)}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-black/5" />
    </div>
  );
};

export default MapView;