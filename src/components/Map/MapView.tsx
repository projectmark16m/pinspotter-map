import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = "YOUR_MAPBOX_TOKEN";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

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
  }, [markers]);

  return (
    <div className={cn("relative w-full h-full min-h-[400px]", className)}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-black/5" />
    </div>
  );
};

export default MapView;