import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Queue from '../models/Queue.js'
import authMiddleware from '../middleware/auth.js'
import { getDynamicPosition } from '../services/queueService.js'

const router = express.Router()

// Helper to sign JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

// 1. Create Account (Register)
router.post('/register', async (req, res) => {
  try {
    const { email, pin } = req.body

    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and 4-digit PIN are required' })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Validate email format
    if (!cleanEmail.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address' })
    }

    // Validate 4-digit PIN format
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN passcode must be exactly 4 digits' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' })
    }

    // Create user
    const user = await User.create({ email: cleanEmail, pin })

    // Automatically link any existing active waitlists matching this email
    await Queue.updateMany(
      { email: cleanEmail, status: { $in: ['waiting', 'notified'] } },
      { userId: user._id }
    )

    const token = generateToken(user)

    res.status(201).json({
      token,
      email: user.email
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 2. Login
router.post('/login', async (req, res) => {
  try {
    const { email, pin } = req.body

    if (!email || !pin) {
      return res.status(400).json({ message: 'Email and PIN are required' })
    }

    const cleanEmail = email.trim().toLowerCase()

    const user = await User.findOne({ email: cleanEmail })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or PIN' })
    }

    const isMatch = await user.comparePin(pin)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or PIN' })
    }

    // Automatically link/sync any active waitlists matching this email to ensure consistency
    await Queue.updateMany(
      { email: cleanEmail, status: { $in: ['waiting', 'notified'] } },
      { userId: user._id }
    )

    const token = generateToken(user)

    res.json({
      token,
      email: user.email
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// 3. Get profile details & active queue sessions
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-pin')
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Retrieve all active queue reservations (waiting, notified, or claimed/charging)
    const activeEntries = await Queue.find({
      userId: user._id,
      status: { $in: ['waiting', 'notified', 'claimed'] }
    }).sort({ joinedAt: -1 })

    // Calculate dynamic ranks for active waiting/notified entries
    const queuesWithPosition = await Promise.all(
      activeEntries.map(async (entry) => {
        const position = await getDynamicPosition(entry)
        return {
          queueId: entry._id,
          stationId: entry.stationId,
          stationName: entry.stationName,
          email: entry.email,
          position: position,
          status: entry.status,
          claimExpiresAt: entry.claimExpiresAt,
          joinedAt: entry.joinedAt
        }
      })
    )

    res.json({
      user: {
        id: user._id,
        email: user.email
      },
      queues: queuesWithPosition
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
