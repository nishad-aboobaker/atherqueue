import { useState } from 'react'
import Map from '../components/Map'
import StationSheet from '../components/StationSheet'

export default function MapPage() {
  const [selectedStation, setSelectedStation] = useState(null)

  return (
    <div className='w-full h-screen relative'>
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
