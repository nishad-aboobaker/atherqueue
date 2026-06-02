import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'
import QueuePage from './pages/QueuePage'
import ClaimPage from './pages/ClaimPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MapPage />} />
        <Route path='/queue/:queueId' element={<QueuePage />} />
        <Route path='/claim/:token' element={<ClaimPage />} />
      </Routes>
    </BrowserRouter>
  )
}
