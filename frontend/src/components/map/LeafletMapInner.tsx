'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface MapMarker {
  id: string;
  title: string;
  subtitle?: string;
  latitude: number;
  longitude: number;
  type: 'destination' | 'city' | 'poi' | 'hotel';
  category?: string;
  linkUrl?: string;
}

interface LeafletMapInnerProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export default function LeafletMapInner({
  markers,
  center = [20.5937, 78.9629], // India centroid
  zoom = 5,
  className = 'h-96 w-full rounded-2xl',
}: LeafletMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter valid markers
    const validMarkers = markers.filter(
      (m) =>
        m.latitude !== undefined &&
        m.longitude !== undefined &&
        !isNaN(m.latitude) &&
        !isNaN(m.longitude) &&
        !(m.latitude === 0 && m.longitude === 0)
    );

    let initialCenter: [number, number] = center;
    let initialZoom = zoom;

    if (validMarkers.length === 1) {
      initialCenter = [validMarkers[0].latitude, validMarkers[0].longitude];
      initialZoom = 13;
    } else if (validMarkers.length > 1) {
      initialCenter = [validMarkers[0].latitude, validMarkers[0].longitude];
    }

    // Initialize Map instance
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const markerGroup = L.featureGroup();

    // Helper to generate custom pin SVG HTML
    const createCustomIcon = (type: MapMarker['type']) => {
      let bgColor = '#F59E0B'; // Saffron for destination
      let symbol = '📍';

      if (type === 'poi') {
        bgColor = '#0F766E'; // Teal for POI
        symbol = '📸';
      } else if (type === 'hotel') {
        bgColor = '#312E81'; // Deep Indigo for hotel
        symbol = '🏨';
      } else if (type === 'city') {
        bgColor = '#4338CA'; // Indigo for City
        symbol = '🏛️';
      }

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            background-color: ${bgColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; line-height: 1;">${symbol}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    validMarkers.forEach((m) => {
      const icon = createCustomIcon(m.type);
      const marker = L.marker([m.latitude, m.longitude], { icon });

      const popupContent = `
        <div style="font-family: inherit; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 700; color: #64748B; margin-bottom: 2px;">
            ${m.type} ${m.category ? '• ' + m.category : ''}
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #171717; margin-bottom: 4px;">
            ${m.title}
          </div>
          ${m.subtitle ? `<div style="font-size: 12px; color: #475569; margin-bottom: 6px;">${m.subtitle}</div>` : ''}
          ${m.linkUrl ? `<a href="${m.linkUrl}" style="display: inline-block; font-size: 11px; font-weight: 600; color: #312E81; text-decoration: underline;">Explore &rarr;</a>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(map);
      markerGroup.addLayer(marker);
    });

    if (validMarkers.length > 1) {
      map.fitBounds(markerGroup.getBounds(), { padding: [40, 40], maxZoom: 14 });
    } else if (validMarkers.length === 1) {
      map.setView([validMarkers[0].latitude, validMarkers[0].longitude], 12);
    }

    // Force Leaflet to recalculate container dimensions to avoid partial tiles or cut-off maps
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleResize);
    };
  }, [markers, center, zoom]);

  return <div ref={mapContainerRef} className={`relative z-0 isolate overflow-hidden ${className}`} />;
}
