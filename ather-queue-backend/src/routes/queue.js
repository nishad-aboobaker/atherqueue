import express from 'express'
import Queue from '../models/Queue.js'
import {
  createQueueEntry,
  claimSpot,
  removeFromQueue,
  getQueueLength,
  getDynamicPosition
} from '../services/queueService.js'
import {
  startMonitoring,
  stopMonitoring,
  processQueueNotifications
} from '../workers/stationMonitor.js'

const router = express.Router()

router.post('/join', async (req, res) => {
  try {
    const { stationId, stationName, email } = req.body
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    if (!stationId || !stationName || !email) {
      return res.status(400).json({ message: 'stationId, stationName and email are required' })
    }

    const entry = await createQueueEntry(stationId, stationName, email, ipAddress)
    
    // Retrieve the dynamically calculated rank
    const currentPosition = await getDynamicPosition(entry)

    // Initialize background monitor repeatable jobs
    await startMonitoring(stationId, stationName)

    // Instantly check and process notifications (avoids waiting for the first 2-minute tick)
    await processQueueNotifications(stationId, stationName)

    res.json({
      queueId: entry._id,
      position: currentPosition,
      stationName: entry.stationName,
      email: entry.email
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/:queueId', async (req, res) => {
  try {
    const entry = await Queue.findById(req.params.queueId)
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' })

    const currentPosition = await getDynamicPosition(entry)

    res.json({
      queueId: entry._id,
      stationId: entry.stationId,
      stationName: entry.stationName,
      email: entry.email,
      position: currentPosition,
      status: entry.status,
      claimExpiresAt: entry.claimExpiresAt
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/claim/:token', async (req, res) => {
  try {
    const entry = await claimSpot(req.params.token)

    // Notify the next person in line immediately if other spots are available
    await processQueueNotifications(entry.stationId, entry.stationName)

    res.json({
      stationName: entry.stationName,
      claimExpiresAt: entry.claimExpiresAt
    })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.delete('/:queueId', async (req, res) => {
  try {
    const entry = await Queue.findById(req.params.queueId)
    if (!entry) return res.status(404).json({ message: 'Queue entry not found' })

    const wasNotified = entry.status === 'notified'
    await removeFromQueue(req.params.queueId)

    // If the person who left was notified, immediately notify the next waiting user.
    // Otherwise, check if we need to shut down the background monitor.
    if (wasNotified) {
      await processQueueNotifications(entry.stationId, entry.stationName)
    } else {
      const queueLength = await getQueueLength(entry.stationId)
      if (queueLength === 0) {
        await stopMonitoring(entry.stationId)
      }
    }

    res.json({ message: 'Left queue successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/skip/:token', async (req, res) => {
  try {
    const entry = await Queue.findOne({ claimToken: req.params.token })
    if (!entry) return res.status(404).json({ message: 'Invalid token' })
    
    entry.status = 'expired'
    await entry.save()

    // Immediately trigger notifying the next waiting user since this user skipped their turn!
    await processQueueNotifications(entry.stationId, entry.stationName)

    res.json({ message: 'Skipped successfully' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

export default router