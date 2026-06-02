import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ClaimPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [status, setStatus] = useState('loading')
  const [queue, setQueue] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    claimSpot()
  }, [token])

  useEffect(() => {
    if (!queue?.claimExpiresAt) return

    const expires = new Date(queue.claimExpiresAt).getTime()

    const interval = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expires - Date.now()) / 1000)
      )

      setTimeLeft(diff)

      if (diff === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [queue])

  async function claimSpot() {
    try {
      const res = await api.post(`/queue/claim/${token}`)
      setQueue(res.data)
      setStatus('claimed')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const directionsUrl = queue
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        queue.stationName
      )}`
    : '#'

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-slate-950 text-white gap-4'>
        <div className='w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin' />
        <p className='text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse'>Verifying reservation...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-950 p-6 text-center text-white'>
        <div className='max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative'>
          <div className='text-rose-400 text-4xl mb-4'>⚠️</div>
          <h2 className='text-lg font-bold mb-2'>Invalid or Expired</h2>
          <p className='text-slate-400 text-sm mb-6 leading-relaxed'>
            This claim token is either invalid, has already been used, or the claim window expired. Please re-enter the queue from the main map.
          </p>
          <button
            onClick={() => navigate('/')}
            className='w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition duration-200 cursor-pointer'
          >
            Back to Home Map
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden'>
      {/* Radiant celebratory background glow */}
      <div className='absolute w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none' />

      <div className='bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-md text-center shadow-2xl relative z-10 animate-scale-up'>
        
        {/* Animated Celebration Icon */}
        <div className='w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-5 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-bounce'>
          ⚡
        </div>

        <h1 className='text-2xl font-black tracking-tight mb-1'>
          Charger Secured!
        </h1>

        <p className='text-slate-400 text-xs font-semibold leading-relaxed truncate max-w-xs mx-auto mb-6'>
          {queue?.stationName}
        </p>

        {/* Circular glowing countdown card */}
        {timeLeft !== null && (
          <div className='bg-slate-950/60 border border-slate-800/60 rounded-2xl p-5 mb-8 shadow-inner'>
            <p className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2.5'>
              Arrive & Plug In Within
            </p>
            <div className='text-3xl font-black text-amber-400 font-mono tracking-wide'>
              {formatTime(timeLeft)}
            </div>
            <p className='text-slate-400 text-[9px] font-medium mt-2 leading-relaxed'>
              Please plug in your Ather EV before the timer expires to keep this reservation.
            </p>
          </div>
        )}

        <div className='space-y-3'>
          <a
            href={directionsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black tracking-wide shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer'
          >
            <span>🧭</span>
            <span>Get Navigation Directions</span>
          </a>

          <button
            onClick={() => navigate('/')}
            className='w-full bg-slate-800/60 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold py-3.5 rounded-xl border border-slate-700/60 hover:border-slate-700/80 transition-all duration-200 text-sm cursor-pointer'
          >
            Back to Live Map
          </button>
        </div>
      </div>
    </div>
  )
}