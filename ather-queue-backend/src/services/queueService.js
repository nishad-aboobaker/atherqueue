import Queue from '../models/Queue.js'
import crypto from 'crypto'

export async function getQueueLength(stationId) {
  return await Queue.countDocuments({
    stationId,
    status: { $in: ['waiting', 'notified'] }
  })
}

export async function getDynamicPosition(queueEntry) {
  if (!queueEntry || !['waiting', 'notified'].includes(queueEntry.status)) {
    return null
  }
  const count = await Queue.countDocuments({
    stationId: queueEntry.stationId,
    status: { $in: ['waiting', 'notified'] },
    joinedAt: { $lt: queueEntry.joinedAt }
  })
  return count + 1
}

export async function getNextInQueue(stationId) {
  return await Queue.findOne({
    stationId,
    status: 'waiting'
  }).sort({ joinedAt: 1 })
}

export async function createQueueEntry(stationId, stationName, email, ipAddress) {
  const existing = await Queue.findOne({
    stationId,
    email,
    status: { $in: ['waiting', 'notified'] }
  })
  if (existing) throw new Error('This email is already in queue for this station')

  const ipExists = await Queue.findOne({
    stationId,
    ipAddress,
    status: { $in: ['waiting', 'notified'] }
  })
  if (ipExists) throw new Error('Too many requests from your location')

  const entry = await Queue.create({ stationId, stationName, email, ipAddress })
  return entry
}

export async function markNotified(queueEntry) {
  const claimToken = crypto.randomBytes(32).toString('hex')
  const claimWindowMinutes = parseInt(process.env.CLAIM_WINDOW_MINUTES) || 5
  const claimExpiresAt = new Date(Date.now() + claimWindowMinutes * 60 * 1000)
  queueEntry.status = 'notified'
  queueEntry.claimToken = claimToken
  queueEntry.notifiedAt = new Date()
  queueEntry.claimExpiresAt = claimExpiresAt
  await queueEntry.save()
  return claimToken
}

export async function claimSpot(token) {
  const entry = await Queue.findOne({ claimToken: token })
  if (!entry) throw new Error('Invalid token')
  if (entry.status !== 'notified') throw new Error('This claim is no longer valid')
  if (new Date() > entry.claimExpiresAt) throw new Error('Claim window has expired')
  entry.status = 'claimed'
  await entry.save()
  return entry
}

export async function expireAndAdvance(stationId) {
  const now = new Date()
  const expiredEntries = await Queue.find({
    stationId,
    status: 'notified',
    claimExpiresAt: { $lt: now }
  })
  for (const entry of expiredEntries) {
    entry.status = 'expired'
    await entry.save()
  }
}

export async function removeFromQueue(queueId) {
  const entry = await Queue.findById(queueId)
  if (!entry) throw new Error('Queue entry not found')
  entry.status = 'left'
  await entry.save()
}