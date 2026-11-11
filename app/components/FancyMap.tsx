"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Replace with your public Mapbox token from mapbox.com
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapProps {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
}

export default function FancyMap({
  lat = 40.7128,
  lng = -74.006,
  title = "Lagzi helyszín",
  address = "Szent Mihály Közösségi Ház",
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Available styles: 
    // 'mapbox://styles/mapbox/dark-v11'
    // 'mapbox://styles/mapbox/light-v11'
    // 'mapbox://styles/mapbox/navigation-night-v1'
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: 14,
      pitch: 45, // Gives a stylish 3D tilt
    });

    // Custom Marker Pin
    new mapboxgl.Marker({ color: "#6366f1" })
      .setLngLat([lng, lat])
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => map.remove();
  }, [lat, lng]);

  const routeUrlCar = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  const routeUrlBus = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`;

  return (
    <div className=" mt-10 relative w-[35rem] mx-auto h-[400px] rounded-3xl shadow-2xl border border-white/10">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Glassmorphic Overlay Floating Card */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-sm text-gray-400">{address}</p>
        </div>
        <a
          href={routeUrlCar}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Hogyan jutok oda autóval?
        </a>
        <a
          href={routeUrlBus}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Hogyan jutok oda busszal?
        </a>
      </div>
    </div>
  );
}