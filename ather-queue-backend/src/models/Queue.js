import mongoose from 'mongoose'

const queueSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true
  },
  stationName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  position: {
    type: Number
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'claimed', 'expired', 'left'],
    default: 'waiting'
  },
  claimToken: {
    type: String,
    unique: true,
    sparse: true
  },
  notifiedAt: {
    type: Date
  },
  claimExpiresAt: {
    type: Date
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
})

queueSchema.index({ stationId: 1, status: 1, joinedAt: 1 })

export default mongoose.model('Queue', queueSchema)
