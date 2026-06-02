import { useState } from 'react'
import { Link } from 'react-router-dom'
import Map from '../components/Map'
import StationSheet from '../components/StationSheet'

export default function MapPage() {
  const [selectedStation, setSelectedStation] = useState(null)

  return (
    <div className='w-full h-screen relative overflow-hidden'>
      {/* Floating User Profile / Dashboard Link */}
      <div className='absolute top-4 right-4 z-20'>
        <Link
          to='/dashboard'
          className='flex items-center gap-2 bg-slate-950/85 hover:bg-slate-900 border border-slate-800/80 backdrop-blur-md px-4.5 py-3 rounded-2xl text-xs font-black text-white shadow-2xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]'
        >
          <span>👤</span>
          <span>My Sessions</span>
        </Link>
      </div>

      <Map onStationSelect={setSelectedStation} />
      {selectedStation && (
        <StationSheet
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}
    </div>
  )
}
