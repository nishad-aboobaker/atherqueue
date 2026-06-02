import { Queue, Worker } from 'bullmq'
import redis from '../config/redis.js'
import { getStationAvailability } from '../services/placesService.js'
import { getNextInQueue, markNotified, expireAndAdvance, getQueueLength } from '../services/queueService.js'
import { sendNotificationEmail } from '../services/notificationService.js'
import QueueModel from '../models/Queue.js'

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS) || 120000

const monitorQueue = new Queue('station-monitor', { connection: redis })

export async function processQueueNotifications(stationId, stationName) {
  try {
    // 1. Process any expired notified entries and advance the queue
    await expireAndAdvance(stationId)

    const queueLength = await getQueueLength(stationId)
    if (queueLength === 0) {
      await stopMonitoring(stationId)
      return
    }

    // 2. Query actual availability from places API
    const { availableCount } = await getStationAvailability(stationId)

    // Resilient fallback: If live availableCount is null/unsupported, default to 1 so the queue doesn't lock up
    const effectiveAvailable = (availableCount !== null && availableCount !== undefined) ? availableCount : 1

    // 3. Count active utilization (currently notified or actively charging/claimed)
    const activeUtilization = await QueueModel.countDocuments({
      stationId,
      status: { $in: ['notified', 'claimed'] }
    })

    // 4. Calculate how many spots are vacant
    const spotsToNotify = Math.max(0, effectiveAvailable - activeUtilization)

    if (spotsToNotify > 0) {
      for (let i = 0; i < spotsToNotify; i++) {
        const next = await getNextInQueue(stationId)
        if (!next) break
        const token = await markNotified(next)
        await sendNotificationEmail(next.email, stationName, token)
        console.log(`Resilient notify: notified ${next.email} for station ${stationName}`)
      }
    }
  } catch (err) {
    console.error('Queue notification processor error for', stationId, err.message)
  }
}

const worker = new Worker('station-monitor', async (job) => {
  const { stationId, stationName } = job.data
  await processQueueNotifications(stationId, stationName)
}, { connection: redis })

export async function startMonitoring(stationId, stationName) {
  const jobId = 'monitor-' + stationId
  const jobs = await monitorQueue.getRepeatableJobs()
  const alreadyRunning = jobs.find(j => j.key.includes(stationId))
  if (alreadyRunning) return

  await monitorQueue.add(
    jobId,
    { stationId, stationName },
    {
      repeat: { every: POLL_INTERVAL },
      jobId: jobId
    }
  )
  console.log('Started monitoring:', stationName)
}

export async function stopMonitoring(stationId) {
  const jobs = await monitorQueue.getRepeatableJobs()
  const job = jobs.find(j => j.key.includes(stationId))
  if (job) {
    await monitorQueue.removeRepeatableByKey(job.key)
    console.log('Stopped monitoring:', stationId)
  }
}

export async function recoverActiveQueues() {
  const activeQueues = await QueueModel.distinct('stationId', {
    status: { $in: ['waiting', 'notified'] }
  })

  for (const stationId of activeQueues) {
    const entry = await QueueModel.findOne({ stationId })
    if (entry) {
      await startMonitoring(stationId, entry.stationName)
      console.log('Recovered monitoring for:', stationId)
    }
  }
}