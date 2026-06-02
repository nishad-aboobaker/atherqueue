import express from 'express'
import { getNearbyStations } from '../services/placesService.js'
import Station from '../models/Station.js'
import Queue from '../models/Queue.js'

const router = express.Router()

router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' })

    const places = await getNearbyStations(parseFloat(lat), parseFloat(lng))

    const stations = await Promise.all(places.map(async (place) => {
      const aggregation = place.evChargeOptions?.connectorAggregation?.[0]

      await Station.findOneAndUpdate(
        { placeId: place.id },
        {
          placeId: place.id,
          displayName: place.displayName?.text,
          address: place.formattedAddress,
          location: {
            lat: place.location?.latitude,
            lng: place.location?.longitude
          },
          connectorCount: aggregation?.count || 1,
          availableCount: aggregation?.availableCount ?? null,
          lastUpdated: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      )

      const queueLength = await Queue.countDocuments({
        stationId: place.id,
        status: { $in: ['waiting', 'notified'] }
      })

      return {
        id: place.id,
        displayName: place.displayName?.text,
        address: place.formattedAddress,
        location: {
          lat: place.location?.latitude,
          lng: place.location?.longitude
        },
        availableCount: aggregation?.availableCount ?? null,
        connectorCount: aggregation?.count || 1,
        queueLength
      }
    }))

    res.json(stations)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch stations' })
  }
})

export default router