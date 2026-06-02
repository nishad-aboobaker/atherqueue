import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function JoinQueueModal({ station, onClose }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleJoin() {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/queue/join', {
        stationId: station.id,
        stationName: station.displayName,
        email: email
      })
      navigate('/queue/' + res.data.queueId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue')
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in'>
      <div className='bg-slate-900 border border-slate-800/80 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-up'>
        
        {/* Decorative electric glow */}
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none' />

        <div className='text-center mb-6'>
          <div className='w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'>
            ⚡
          </div>
          <h2 className='text-white text-xl font-extrabold tracking-tight'>Queue Reservation</h2>
          <p className='text-slate-400 text-xs mt-1 leading-relaxed max-w-xs mx-auto'>
            You are joining the waitlist for <span className='text-slate-200 font-semibold'>{station.displayName}</span>
          </p>
        </div>

        <div className='space-y-4'>
          <div>
            <label htmlFor='email' className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2 block'>
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='name@domain.com'
              className='w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 outline-none transition-all duration-200 text-sm font-medium'
              required
            />
          </div>

          {error && (
            <div className='bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 text-rose-400 text-xs font-semibold leading-relaxed flex gap-2 items-center'>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className='pt-2 space-y-2'>
            <button
              onClick={handleJoin}
              disabled={loading}
              className='w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:active:scale-100 text-slate-950 font-black tracking-wide py-3.5 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.2)] transition-all duration-200 text-sm cursor-pointer'
            >
              {loading ? (
                <div className='flex items-center justify-center gap-2'>
                  <div className='w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin' />
                  <span>Reserving Spot...</span>
                </div>
              ) : (
                'Confirm Waitlist Spot'
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className='w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold py-3.5 rounded-xl border border-slate-700/40 hover:border-slate-700/80 transition-all duration-200 text-sm cursor-pointer'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
