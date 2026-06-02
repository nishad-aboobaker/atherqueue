import { useState } from 'react'
import { formatWaitTime, getEstimatedWait, getStatusColor } from '../utils/helpers'
import JoinQueueModal from './JoinQueueModal'

export default function StationSheet({ station, onClose }) {
  const [showModal, setShowModal] = useState(false)

  const statusColor = getStatusColor(station.availableCount)
  const isAvailable = statusColor === 'green'

  return (
    <>
      <div className='absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 max-w-lg mx-auto md:bottom-6 md:left-6 md:right-auto md:rounded-3xl md:w-[420px] md:border md:shadow-2xl animate-slide-up'>
        {/* Drag handle decoration */}
        <div className='w-12 h-1 bg-slate-700/80 rounded-full mx-auto mb-5 md:hidden' />

        {/* Station Details Header */}
        <div className='flex justify-between items-start gap-4 mb-5'>
          <div className='flex-1'>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping' />
              Ather Grid Charging
            </span>
            <h2 className='text-white text-xl font-bold tracking-tight'>{station.displayName}</h2>
            <p className='text-slate-400 text-xs mt-1 leading-relaxed'>{station.address}</p>
          </div>
          <button 
            onClick={onClose} 
            className='w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 border border-slate-700/50'
            aria-label='Close drawer'
          >
            ✕
          </button>
        </div>

        {/* Information Grid Cards */}
        <div className='grid grid-cols-3 gap-3 mb-6'>
          {/* Status Indicator Card */}
          <div className='bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-center flex flex-col justify-between'>
            <div className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2'>Chargers</div>
            <div className={`text-sm font-black tracking-tight ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {station.availableCount ?? 1} / {station.connectorCount || 1} Free
            </div>
            <div className='text-[10px] text-slate-400 font-medium mt-1.5'>
              {isAvailable ? '🟢 Online' : '🔴 Fully Used'}
            </div>
          </div>

          {/* Queue Length Card */}
          <div className='bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-center flex flex-col justify-between'>
            <div className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2'>In Queue</div>
            <div className='text-lg font-black text-white leading-none mt-1'>
              {station.queueLength || 0}
            </div>
            <div className='text-[10px] text-slate-400 font-medium mt-2'>
              Riders Waiting
            </div>
          </div>

          {/* Wait Time Estimate Card */}
          <div className='bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-center flex flex-col justify-between'>
            <div className='text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2'>Est. Wait</div>
            <div className='text-md font-bold text-amber-400 leading-none mt-1.5'>
              {station.queueLength ? formatWaitTime(getEstimatedWait(station.queueLength)) : 'None'}
            </div>
            <div className='text-[10px] text-slate-400 font-medium mt-2'>
              ~60m per slot
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowModal(true)}
          className='w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black tracking-wide shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] transition-all duration-200 text-md flex items-center justify-center gap-2 cursor-pointer'
        >
          <span>⚡</span>
          <span>Reserve Queue Spot</span>
        </button>
      </div>

      {showModal && (
        <JoinQueueModal
          station={station}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
