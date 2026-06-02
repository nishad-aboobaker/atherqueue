import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  pin: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Hash the 4-digit PIN before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next()
  try {
    const salt = await bcrypt.genSalt(10)
    this.pin = await bcrypt.hash(this.pin, salt)
    next()
  } catch (err) {
    next(err)
  }
})

// Compare user entered PIN during login
userSchema.methods.comparePin = async function (candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin)
}

export default mongoose.model('User', userSchema)
