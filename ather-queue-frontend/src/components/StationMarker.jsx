import { Marker } from '@react-google-maps/api'
import { getStatusColor } from '../utils/helpers'

function svgIcon(svg) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

function stationIcon(fillColor) {
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

export default function StationMarker({ station, onClick }) {
  const color = getStatusColor(station.availableCount)
  const fillColor = color === 'green' ? '#22c55e' : color === 'red' ? '#ef4444' : '#6b7280'

  return (
    <Marker
      key={station.id}
      position={station.location}
      onClick={() => onClick(station)}
      icon={stationIcon(fillColor)}
    />
  )
}
