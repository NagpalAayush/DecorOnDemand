import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

function LocationMap({ latitude, longitude, radiusKm, onLocationChange }) {
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const radiusCircleRef = useRef(null)
  const onLocationChangeRef = useRef(onLocationChange)

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange
  }, [onLocationChange])

  useEffect(() => {
    let isCancelled = false

    async function initializeMap() {
      if (!mapElementRef.current || mapRef.current || !latitude || !longitude) {
        return
      }

      const leaflet = await import('leaflet')
      if (isCancelled || !mapElementRef.current) {
        return
      }

      const map = leaflet.map(mapElementRef.current).setView([latitude, longitude], 13)
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const marker = leaflet.marker([latitude, longitude], { draggable: true }).addTo(map)
      const radiusCircle = leaflet.circle([latitude, longitude], {
        radius: Number(radiusKm) * 1000,
        color: '#d75443',
        fillColor: '#efad93',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map)
      marker.on('dragend', () => {
        const position = marker.getLatLng()
        onLocationChangeRef.current({ latitude: position.lat, longitude: position.lng })
      })
      map.on('click', (event) => {
        marker.setLatLng(event.latlng)
        onLocationChangeRef.current({ latitude: event.latlng.lat, longitude: event.latlng.lng })
      })

      mapRef.current = map
      markerRef.current = marker
      radiusCircleRef.current = radiusCircle
    }

    initializeMap()
    return () => {
      isCancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
      radiusCircleRef.current = null
    }
  }, [latitude, longitude])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !latitude || !longitude) {
      return
    }

    const position = [latitude, longitude]
    markerRef.current.setLatLng(position)
    radiusCircleRef.current?.setLatLng(position)
    mapRef.current.setView(position)
  }, [latitude, longitude])

  useEffect(() => {
    if (!radiusCircleRef.current || !Number.isFinite(Number(radiusKm))) {
      return
    }

    radiusCircleRef.current.setRadius(Number(radiusKm) * 1000)
  }, [radiusKm])

  return <div ref={mapElementRef} className="mt-4 h-72 w-full rounded-xl" />
}

export default LocationMap
