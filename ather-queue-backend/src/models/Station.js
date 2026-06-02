import mongoose from 'mongoose'

const stationSchema = new mongoose.Schema({
  placeId: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  connectorCount: {
    type: Number,
    default: 1
  },
  availableCount: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Station', stationSchema)
