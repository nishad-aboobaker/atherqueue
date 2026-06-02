import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { formatWaitTime, getEstimatedWait } from '../utils/helpers'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [queues, setQueues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
    const interval = setInterval(fetchProfile, 15000) // Poll profile waitlist states
    return () => clearInterval(interval)
  }, [])

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      setQueues(res.data.queues)
      setLoading(false)
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout()
      } else {
        setError('Failed to sync profile sessions')
        setLoading(false)
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    navigate('/auth')
  }

  async function handleLeaveQueue(queueId) {
    if (!window.confirm('Are you sure you want to release your spot at this station?')) return
    try {
      await api.delete('/queue/' + queueId)
      // Filter out of current UI state instantly
      setQueues(queues.filter(q => q.queueId !== queueId))
    } catch (err) {
      alert('Failed to exit queue')
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-white bg-slate-950 gap-4'>
        <div className='w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin' />
        <p className='text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse'>Syncing your waitlist...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-950 text-white flex flex-col'>
      {/* Premium Cyber-Dark Top Navigation Bar */}
      <nav className='bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30'>
        <div className='max-w-4xl mx-auto flex items-center justify-between gap-4'>
          <Link to='/' className='flex items-center gap-2'>
            <span className='text-emerald-400 text-xl font-bold animate-pulse'>⚡</span>
            <span className='text-white font-extrabold tracking-widest text-xs uppercase hidden sm:inline'>Ather Grid Queue</span>
          </Link>
          
          <div className='flex items-center gap-4'>
            <div className='hidden sm:block text-right'>
              <p className='text-slate-500 text-[9px] font-bold uppercase tracking-wider'>Logged in as</p>
              <p className='text-slate-300 text-xs font-semibold max-w-[180px] truncate'>{user?.email}</p>
            </div>
            
            <Link 
              to='/' 
              className='bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition duration-200 border border-slate-700/50'
            >
              🗺️ Map View
            </Link>

            <button 
              onClick={handleLogout}
              className='bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/35 text-xs font-bold px-4 py-2 rounded-xl transition duration-200 cursor-pointer'
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Panel */}
      <main className='flex-grow max-w-4xl w-full mx-auto p-6 space-y-6'>
        
        {/* Floating electric glow decoration */}
        <div className='absolute w-96 h-96 bg-emerald-500/5 rounded-full blur-[80px] -top-12 -left-12 pointer-events-none' />

        <div className='flex justify-between items-center mb-2 z-10 relative'>
          <div>
            <h1 className='text-2xl font-black tracking-tight'>My Active Sessions</h1>
            <p className='text-slate-400 text-xs mt-1'>Monitor your real-time waiting times and charging spots</p>
          </div>
        </div>

        {error && (
          <div className='bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3 text-rose-400 text-xs font-semibold flex gap-2 items-center animate-fade-in relative z-10'>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className='space-y-4 relative z-10'>
          {queues.length === 0 ? (
            /* Empty State Display */
            <div className='bg-slate-900/40 border border-slate-850/60 rounded-3xl p-12 text-center shadow-2xl backdrop-blur-sm max-w-lg mx-auto mt-8 animate-scale-up'>
              <div className='text-5xl mb-4'>📦</div>
              <h3 className='text-white text-lg font-bold'>No Active Sessions</h3>
              <p className='text-slate-400 text-xs leading-relaxed mt-2 max-w-xs mx-auto'>
                You aren't currently waiting in line or charging at any stations. Browse the grid map to find a free plug.
              </p>
              <Link 
                to='/' 
                className='inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-wide px-6 py-3 rounded-xl shadow-[0_4px_16px_rgba(16,185,129,0.2)] mt-6 text-sm transition-all duration-200'
              >
                ⚡ Explore Live Map
              </Link>
            </div>
          ) : (
            /* Active Queues Lists */
            queues.map((item) => {
              const isWaiting = item.status === 'waiting'
              const isNotified = item.status === 'notified'
              const isClaimed = item.status === 'claimed'

              return (
                <div 
                  key={item.queueId} 
                  className='bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700/60 transition-all duration-200 animate-slide-up'
                >
                  <div className='flex-1'>
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border mb-3 ${
                      isClaimed 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : isNotified 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isClaimed ? 'bg-emerald-400 animate-pulse' : isNotified ? 'bg-amber-400 animate-ping' : 'bg-blue-400'}`} />
                      {isClaimed ? 'Actively Charging' : isNotified ? 'Charger Ready (Notified)' : 'Waiting in Queue'}
                    </span>
                    
                    <h3 className='text-white text-lg font-bold tracking-tight'>{item.stationName}</h3>
                    <p className='text-slate-400 text-[10px] mt-1.5 leading-none'>Joined at: {new Date(item.joinedAt).toLocaleTimeString()}</p>
                  </div>

                  {/* Core wait metrics */}
                  <div className='flex items-center gap-6 bg-slate-950/40 border border-slate-800/40 rounded-2xl p-4 md:py-3.5 px-6 shadow-inner'>
                    {isClaimed ? (
                      <div className='text-center min-w-[70px]'>
                        <p className='text-2xl font-black text-emerald-400 animate-pulse'>⚡</p>
                        <p className='text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1'>Charging</p>
                      </div>
                    ) : (
                      <>
                        <div className='text-center min-w-[70px] border-r border-slate-800/60 pr-6'>
                          <p className='text-2xl font-black text-white'>#{item.position}</p>
                          <p className='text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1'>Position</p>
                        </div>
                        <div className='text-center min-w-[70px]'>
                          <p className='text-2xl font-black text-amber-400'>
                            {isNotified ? 'Now' : formatWaitTime(getEstimatedWait(item.position - 1))}
                          </p>
                          <p className='text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-1'>Est. Wait</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Dashboard Queue Actions */}
                  <div className='flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t border-slate-800/60 md:border-none'>
                    <Link
                      to={'/queue/' + item.queueId}
                      className='flex-1 md:flex-none text-center bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3.5 rounded-xl transition duration-200 border border-slate-700/50'
                    >
                      Track Details
                    </Link>
                    
                    <button
                      onClick={() => handleLeaveQueue(item.queueId)}
                      className={`flex-1 md:flex-none font-bold text-xs px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_4px_12px_rgba(16,185,129,0.15)]'
                          : 'bg-slate-800/60 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/25 text-slate-300'
                      }`}
                    >
                      {isClaimed ? 'Finish Charging' : 'Leave Waitlist'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
