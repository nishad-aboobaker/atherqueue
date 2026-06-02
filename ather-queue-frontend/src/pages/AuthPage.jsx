import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to dashboard or previous location if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard')
    }
  }, [navigate])

  function handlePinChange(index, value) {
    if (isNaN(value)) return // Allow only numbers
    
    const newPin = [...pin]
    newPin[index] = value.slice(-1) // Take only the last character
    setPin(newPin)

    // Automatically focus the next input box
    if (value && index < 3) {
      pinRefs[index + 1].current.focus()
    }
  }

  function handleKeyDown(index, e) {
    // Focus the previous input box on backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current.focus()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const pinStr = pin.join('')
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (pinStr.length !== 4) {
      setError('Please enter a 4-digit PIN passcode')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const res = await api.post(endpoint, {
        email,
        pin: pinStr
      })
      
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userEmail', res.data.email)
      
      // Auto-redirect to dashboard or main map
      const origin = location.state?.from?.pathname || '/dashboard'
      navigate(origin)
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed')
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden'>
      {/* Decorative neon ambient background */}
      <div className='absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-[80px] -top-12 -left-12 pointer-events-none' />
      <div className='absolute w-96 h-96 bg-blue-500/5 rounded-full blur-[80px] -bottom-12 -right-12 pointer-events-none' />

      <div className='bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-8 w-full max-w-md shadow-2xl relative z-10 animate-scale-up'>
        
        {/* Floating electric accent */}
        <div className='absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none' />

        <div className='text-center mb-8'>
          <div className='w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'>
            ⚡
          </div>
          <h1 className='text-2xl font-black tracking-tight mb-1'>Ather Grid Queue</h1>
          <p className='text-slate-400 text-xs font-semibold leading-relaxed max-w-xs mx-auto'>
            {isLogin ? 'Log in to track your charging sessions' : 'Create an account to join station waitlists'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Email Input */}
          <div>
            <label htmlFor='email' className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5 block'>
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='yourname@domain.com'
              className='w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-4 py-3.5 text-white placeholder-slate-700 outline-none transition-all duration-200 text-sm font-medium'
              required
            />
          </div>

          {/* 4-Digit Passcode PIN */}
          <div>
            <label className='text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2.5 block'>
              4-Digit PIN Passcode
            </label>
            <div className='flex justify-between gap-3'>
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={pinRefs[index]}
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  className='w-14 h-14 bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-center text-xl font-black text-white outline-none transition-all duration-200'
                  required
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className='bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-rose-400 text-xs font-semibold leading-relaxed flex gap-2 items-center animate-fade-in'>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-500 disabled:active:scale-100 text-slate-950 font-black tracking-wide py-4 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.2)] transition-all duration-200 text-sm cursor-pointer'
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin' />
                <span>Processing...</span>
              </div>
            ) : (
              isLogin ? 'Log In' : 'Create Account'
            )}
          </button>
        </form>

        {/* State Toggle Footer */}
        <div className='mt-8 pt-6 border-t border-slate-800/80 text-center'>
          <button
            type='button'
            onClick={() => {
              setIsLogin(!isLogin)
              setError(null)
              setPin(['', '', '', ''])
            }}
            className='text-emerald-400 hover:text-emerald-300 text-xs font-bold transition duration-200 cursor-pointer'
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>
        </div>
      </div>
    </div>
  )
}
