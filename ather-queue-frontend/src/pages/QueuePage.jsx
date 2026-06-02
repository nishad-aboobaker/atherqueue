import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatWaitTime, getEstimatedWait } from '../utils/helpers'

export default function QueuePage() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)

  // Fetch queue data initially and poll every 10 seconds for real-time responsiveness
  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [queueId])

  // Countdown timer for notified users
  useEffect(() => {
    if (queue?.status !== 'notified' || !queue?.claimExpiresAt) {
      setTimeLeft(null)
      return
    }

    const expires = new Date(queue.claimExpiresAt).getTime()
    
    function updateCountdown() {
      const diff = Math.max(0, Math.floor((expires - Date.now()) / 1000))
      setTimeLeft(diff)
      if (diff === 0) {
        // Poll immediately to capture the expired/advance transition
        fetchQueue()
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [queue])

  async function fetchQueue() {
    try {
      const res = await api.get('/queue/' + queueId)
      setQueue(res.data)
      setLoading(false)
    } catch (err) {
      setError('Queue session has ended or is invalid.')
      setLoading(false)
    }
  }

  async function leaveQueue() {
    try {
      await api.delete('/queue/' + queueId)
      navigate('/')
    } catch (err) {
      setError('Failed to leave queue')
    }
  }

  function formatCountdown(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-white bg-slate-950 gap-4'>
        <div className='w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin' />
        <p className='text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse'>Syncing with Ather Grid...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-950 p-6 text-center text-white'>
        <div className='max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative'>
          <div className='text-rose-400 text-4xl mb-3'>⚠️</div>
          <h2 className='text-lg font-bold mb-2'>Session Expired</h2>
          <p className='text-slate-400 text-sm mb-6'>{error}</p>
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

  const isNotified = queue.status === 'notified'
  const isClaimed = queue.status === 'claimed'

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden'>
      {/* Dynamic ambient energy backgrounds */}
      {isNotified ? (
        <div className='absolute w-96 h-96 bg-amber-500/5 rounded-full blur-[80px] -top-12 -left-12 pointer-events-none' />
      ) : (
        <div className='absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-[80px] -top-12 -left-12 pointer-events-none' />
      )}
      
      <div className='bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-md shadow-2xl relative z-10'>
        
        {/* Header Section */}
        <div className='text-center mb-8'>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border ${
            isNotified 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isNotified ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            {isNotified ? '⚡ Charger Ready' : '⏱️ Waiting in Line'}
          </div>
          <h1 className='text-2xl font-black tracking-tight mb-1'>Ather Grid Waitlist</h1>
          <p className='text-slate-400 text-xs font-semibold leading-relaxed truncate max-w-xs mx-auto'>{queue.stationName}</p>
        </div>

        {/* Dynamic Display State */}
        {isNotified ? (
          /* NOTIFIED / READY STATE */
          <div className='space-y-6 text-center animate-fade-in'>
            {/* Glowing countdown circle */}
            <div className='w-40 h-40 bg-amber-500/10 border-4 border-amber-500 rounded-full flex flex-col items-center justify-center mx-auto shadow-[0_0_30px_rgba(245,158,11,0.25)] relative'>
              <span className='text-amber-500 text-2xl font-black mb-1 animate-pulse'>⚡ READY</span>
              {timeLeft !== null && (
                <p className='text-3xl font-black text-white font-mono tracking-tight'>
                  {formatCountdown(timeLeft)}
                </p>
              )}
            </div>

            <div className='bg-slate-950/80 border border-slate-800/60 rounded-2xl p-5 text-left space-y-3 shadow-inner'>
              <h4 className='text-amber-400 text-xs font-bold uppercase tracking-wider flex gap-1.5 items-center'>
                <span>✉️</span> Check Your Inbox
              </h4>
              <p className='text-slate-300 text-xs leading-relaxed font-medium'>
                An authentication claim link has been sent to <span className='text-white font-bold'>{queue.email}</span>. 
              </p>
              <p className='text-slate-400 text-[10px] leading-relaxed'>
                Open the link on your mobile phone to lock in your charger slot before the window closes.
              </p>
            </div>
          </div>
        ) : (
          /* WAITING STATE */
          <div className='space-y-8 animate-fade-in'>
            <div className='flex justify-around items-center gap-4 bg-slate-950/50 border border-slate-800/40 rounded-2xl py-6 px-4 shadow-inner relative'>
              
              {/* Circular Position Tracker */}
              <div className='text-center flex-1'>
                <div className='relative w-24 h-24 mx-auto flex items-center justify-center'>
                  {/* Glowing background circle */}
                  <svg className='absolute inset-0 w-full h-full transform -rotate-90' viewBox='0 0 36 36'>
                    <path
                      className='text-slate-800'
                      strokeWidth='2'
                      stroke='currentColor'
                      fill='none'
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    />
                    <path
                      className='text-emerald-500 shadow-md'
                      strokeWidth='2.5'
                      strokeDasharray={`${Math.max(10, 100 - (queue.position * 15))}, 100`}
                      strokeLinecap='round'
                      stroke='currentColor'
                      fill='none'
                      d='M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831'
                    />
                  </svg>
                  <p className='text-3xl font-black text-emerald-400 tracking-tight'>#{queue.position}</p>
                </div>
                <p className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-3'>Position</p>
              </div>

              {/* Estimate Wait Time */}
              <div className='text-center flex-1'>
                <div className='w-24 h-24 mx-auto flex flex-col items-center justify-center bg-slate-900/80 border border-slate-800 rounded-full'>
                  <p className='text-xl font-black text-amber-400 leading-none'>
                    {formatWaitTime(getEstimatedWait(queue.position - 1))}
                  </p>
                </div>
                <p className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-3'>Est. Wait</p>
              </div>
            </div>

            <div className='bg-slate-950/40 border border-slate-800/40 rounded-2xl p-4.5 text-center shadow-inner'>
              <p className='text-xs text-slate-400 leading-relaxed font-medium'>
                Riders ahead are finishing up. We will send an email alert to <span className='text-slate-200 font-bold'>{queue.email}</span> when a charger opens. Keep this window open to track live position.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className='mt-8 pt-6 border-t border-slate-800/80'>
          <button
            onClick={leaveQueue}
            className='w-full bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 text-slate-300 font-bold py-3.5 rounded-2xl transition-all duration-200 text-sm cursor-pointer'
          >
            Leave Queue
          </button>
        </div>
      </div>
    </div>
  )
}
