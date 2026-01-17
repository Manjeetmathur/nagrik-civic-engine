'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface HeatmapPoint {
    lat: number;
    lng: number;
    intensity: number;
}

interface LeafletHeatmapProps {
    points: HeatmapPoint[];
    userLocation?: { lat: number; lng: number } | null;
    onMapClick?: () => void;
    className?: string;
}

export const LeafletHeatmap: React.FC<LeafletHeatmapProps> = ({
    points,
    userLocation,
    onMapClick,
    className = ''
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const heatLayerRef = useRef<any>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize map centered on India (default)
        const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: false,
        }).setView([20.5937, 78.9629], 5);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Add click handler
        if (onMapClick) {
            map.on('click', onMapClick);
        }

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [onMapClick]);

    // Update heatmap layer when points change
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing heat layer
        if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current);
        }

        if (points.length > 0) {
            // Convert points to Leaflet.heat format: [lat, lng, intensity]
            const heatPoints: [number, number, number][] = points.map(p => [
                p.lat,
                p.lng,
                p.intensity
            ]);

            // Create heat layer
            // @ts-ignore - leaflet.heat types
            heatLayerRef.current = L.heatLayer(heatPoints, {
                radius: 25,
                blur: 35,
                maxZoom: 13,
                max: 1.0,
                gradient: {
                    0.0: '#3b82f6', // blue
                    0.5: '#f59e0b', // amber
                    1.0: '#f43f5e'  // rose
                }
            }).addTo(mapRef.current);

            // Fit bounds to show all points
            const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points]);

    // Update user location marker
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing user marker
        if (userMarkerRef.current) {
            mapRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }

        if (userLocation) {
            // Create custom icon for user location
            const userIcon = L.divIcon({
                className: 'custom-user-marker',
                html: `
          <div class="relative">
            <div class="absolute inset-0 -m-4 w-8 h-8 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
            <div class="relative w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        `,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            });

            userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
                icon: userIcon,
                zIndexOffset: 1000,
            })
                .bindPopup('📍 Your Location')
                .addTo(mapRef.current);
        }
    }, [userLocation]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full ${className}`}
            style={{ minHeight: '300px' }}
        />
    );
};
