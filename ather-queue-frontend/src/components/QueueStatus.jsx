import { formatWaitTime, getEstimatedWait } from '../utils/helpers'

export default function QueueStatus({ queue }) {
  return (
    <div className='bg-zinc-800 rounded-2xl p-6'>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-center'>
          <p className='text-4xl font-bold text-green-400'>#{queue.position}</p>
          <p className='text-zinc-400 text-sm mt-1'>Your position</p>
        </div>
        <div className='text-center'>
          <p className='text-4xl font-bold text-yellow-400'>
            {formatWaitTime(getEstimatedWait(queue.position - 1))}
          </p>
          <p className='text-zinc-400 text-sm mt-1'>Est. wait</p>
        </div>
      </div>
      <div className='bg-zinc-700 rounded-xl p-4'>
        <p className='text-sm text-zinc-300'>
          Notification will be sent to{' '}
          <span className='text-white font-medium'>{queue.email}</span>
        </p>
      </div>
    </div>
  )
}
