import { useEffect, useState, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api'
import useLocation from '../hooks/useLocation'
import api from '../services/api'
import { getStatusColor } from '../utils/helpers'

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] }, // Dark slate
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }, { weight: 2 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] }
]

function svgIcon(svg) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

function stationIcon(fillColor, isPulse = false) {
  return {
    url: svgIcon(`
      <svg width="50" height="58" viewBox="0 0 50 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="glow" x="-10" y="-10" width="70" height="78" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="${fillColor}" flood-opacity="0.65"/>
        </filter>
        <g filter="url(#glow)">
          <path d="M25 4C14.5 4 6 12.1 6 22.1C6 35.6 25 50 25 50C25 50 44 35.6 44 22.1C44 12.1 35.5 4 25 4Z" fill="${fillColor}" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="25" cy="22.5" r="11" fill="#0b0f19" fill-opacity="0.55" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.5"/>
          <path d="M26.5 12.5L19.5 22.5H24.5L23.5 31.5L30.5 21.5H25.5L26.5 12.5Z" fill="#ffffff" stroke="#ffffff" stroke-width="0.5" stroke-linejoin="round"/>
        </g>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(50, 58),
    anchor: new window.google.maps.Point(25, 50),
  }
}

function currentLocationIcon() {
  return {
    url: svgIcon(`
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-5" y="-5" width="58" height="58" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0284c7" flood-opacity="0.4"/>
        </filter>
        <g filter="url(#shadow)">
          <circle cx="24" cy="24" r="18" fill="#0ea5e9" fill-opacity="0.16" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="24" cy="24" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
          <circle cx="24" cy="24" r="3" fill="#ffffff"/>
        </g>
      </svg>
    `),
    scaledSize: new window.google.maps.Size(48, 48),
    anchor: new window.google.maps.Point(24, 24),
  }
}

export default function Map({ onStationSelect }) {
  const { location: geoLoc, error: locationError, loading: locationLoading } = useLocation()
  const [stations, setStations] = useState([])
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }) // Default Bangalore
  const [usingFallback, setUsingFallback] = useState(false)
  const mapRef = useRef(null)

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey || 'missing-google-maps-key'
  })

  // Set center based on user location or fallback
  useEffect(() => {
    if (geoLoc) {
      setMapCenter(geoLoc)
      setUsingFallback(false)
    } else if (locationError) {
      setMapCenter({ lat: 12.9716, lng: 77.5946 })
      setUsingFallback(true)
    }
  }, [geoLoc, locationError])

  // Fetch stations when center is stabilized
  useEffect(() => {
    if (mapCenter) {
      fetchStations(mapCenter)
    }
  }, [mapCenter])

  async function fetchStations(coords) {
    try {
      const res = await api.get('/stations/nearby', {
        params: { lat: coords.lat, lng: coords.lng }
      })
      setStations(res.data)
    } catch (err) {
      console.error('Failed to fetch stations', err)
    }
  }

  function handleMapDragEnd() {
    if (mapRef.current) {
      const center = mapRef.current.getCenter()
      const newCoords = { lat: center.lat(), lng: center.lng() }
      fetchStations(newCoords)
    }
  }

  if (!googleMapsApiKey || loadError) {
    return (
      <div className='w-full h-screen bg-slate-950 flex items-center justify-center px-6 text-center text-white'>
        <div className='max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md'>
          <div className='text-emerald-400 text-4xl mb-4'>⚡</div>
          <h2 className='text-xl font-bold mb-2'>Maps Config Required</h2>
          <p className='text-slate-400 text-sm'>
            Set VITE_GOOGLE_MAPS_KEY to a valid Google Maps JavaScript API key in your environment settings.
          </p>
        </div>
      </div>
    )
  }

  if (locationLoading || !isLoaded) {
    return (
      <div className='w-full h-screen bg-slate-950 flex flex-col items-center justify-center text-white'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-3 h-3 bg-emerald-400 rounded-full animate-ping' />
          <p className='text-slate-200 text-lg font-medium tracking-wide'>Ather Grid Loading...</p>
        </div>
        <p className='text-slate-400 text-xs'>Acquiring geo-positioning satellite data</p>
      </div>
    )
  }

  return (
    <div className='w-full h-screen relative overflow-hidden bg-slate-950'>
      {/* Floating Status / Fallback Header */}
      {usingFallback && (
        <div className='absolute top-4 left-4 right-4 z-10 md:left-auto md:w-96 mx-auto'>
          <div className='bg-slate-900/90 border border-amber-500/20 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-fade-in'>
            <span className='text-amber-400 text-xl mt-0.5'>📍</span>
            <div>
              <h4 className='text-amber-400 text-sm font-bold'>Using Default Location</h4>
              <p className='text-slate-300 text-xs mt-0.5 leading-relaxed'>
                GPS denied. Showing Ather charging stations in Bangalore. Pan the map or drag to search other areas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title logo floating */}
      <div className='absolute top-4 left-6 z-10 hidden md:block'>
        <div className='bg-slate-950/80 border border-slate-800/80 backdrop-blur-lg rounded-2xl px-5 py-3 shadow-2xl flex items-center gap-3'>
          <span className='text-emerald-400 text-2xl font-bold tracking-wide animate-pulse'>⚡</span>
          <span className='text-white font-extrabold tracking-widest text-sm uppercase'>Ather Grid Queue</span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100vh' }}
        center={mapCenter}
        zoom={13}
        onLoad={map => { mapRef.current = map }}
        onDragEnd={handleMapDragEnd}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: false,
          maxZoom: 18,
          minZoom: 10
        }}
      >
        {/* Pulsing circular range for current location */}
        {!usingFallback && geoLoc && (
          <>
            <Circle
              center={geoLoc}
              radius={350}
              options={{
                fillColor: '#10b981',
                fillOpacity: 0.08,
                strokeColor: '#34d399',
                strokeOpacity: 0.35,
                strokeWeight: 1.5,
                clickable: false,
              }}
            />
            <Marker
              position={geoLoc}
              title='Your current location'
              zIndex={1000}
              icon={currentLocationIcon()}
            />
          </>
        )}

        {stations.map(station => {
          const color = getStatusColor(station.availableCount)
          const fillColor = color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#64748b'
          return (
            <Marker
              key={station.id}
              position={station.location}
              onClick={() => onStationSelect(station)}
              icon={stationIcon(fillColor)}
            />
          )
        })}
      </GoogleMap>
    </div>
  )
}
