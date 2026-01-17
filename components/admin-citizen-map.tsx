"use client"

import { useEffect, useRef } from "react"
import type L from "leaflet"
import { Alert } from "@/types"

export function AdminCitizenMap({
    alerts,
    selectedAlert,
}: {
    alerts: Alert[]
    selectedAlert?: Alert | null
}) {
    const mapRef = useRef<L.Map | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const markersRef = useRef<L.LayerGroup | null>(null)

    useEffect(() => {
        let mounted = true

        import("leaflet").then((L) => {
            if (!mounted || mapRef.current) return

            // CSS once
            if (!document.getElementById("leaflet-css")) {
                const link = document.createElement("link")
                link.id = "leaflet-css"
                link.rel = "stylesheet"
                link.href =
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
                document.head.appendChild(link)
            }

            mapRef.current = L.map(containerRef.current!).setView(
                [20.5937, 78.9629], // India
                5
            )

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(mapRef.current)

            markersRef.current = L.layerGroup().addTo(mapRef.current)
        })

        return () => {
            mounted = false
        }
    }, [])

    // MARKERS UPDATE
    useEffect(() => {
        if (!mapRef.current || !markersRef.current) return

        markersRef.current.clearLayers()

        import("leaflet").then((L) => {
            alerts.forEach((alert) => {
                // Extract coordinates from reporter if available
                const coords = alert.reporter?.coordinates
                if (!coords) return // Skip if no coordinates

                const color =
                    alert.status === "Pending"
                        ? "#dc2626"
                        : alert.status === "Resolved"
                            ? "#16a34a"
                            : "#71717a"

                const icon = L.divIcon({
                    className: "emergency-marker",
                    html: `
    <div class="marker-wrapper">
      <span class="marker-pulse" style="border-color: ${color};"></span>
      <span class="marker-core" style="background-color: ${color};"></span>
    </div>
  `,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                })

                const popupContent = `
          <div style="min-width: 200px; color: #18181b; font-family: sans-serif;">
            <b style="font-size: 14px;">${alert.type}</b><br/>
            <span style="color: #71717a; font-size: 13px;">${alert.description}</span><br/>
            <small style="color: #a1a1aa; margin-top: 4px; display: block;">${new Date(alert.timestamp).toLocaleString()}</small>
            <hr style="margin: 8px 0; border-color: #e4e4e7;"/>
            <div style="font-size: 12px;">
              <strong>Reporter:</strong><br/>
              ${alert.reporter?.name || 'Anonymous'}<br/>
              ${alert.reporter?.phone || ''}<br/>
              <span style="color: ${color}; font-weight: 600;">Status: ${alert.status}</span>
            </div>
          </div>
        `

                const marker = L.marker([coords.lat, coords.lng], { icon })
                    .bindPopup(popupContent)

                marker.addTo(markersRef.current!)
            })
        })
    }, [alerts])

    // FOCUS SELECTED
    useEffect(() => {
        if (!mapRef.current || !selectedAlert) return
        const coords = selectedAlert.reporter?.coordinates
        if (!coords) return

        mapRef.current.setView(
            [coords.lat, coords.lng],
            15
        )
    }, [selectedAlert])

    return <div ref={containerRef} className="w-full h-full z-0" />
}
