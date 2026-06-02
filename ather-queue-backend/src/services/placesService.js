import axios from 'axios'

const PLACES_API_URL = 'https://places.googleapis.com/v1/places'

export async function getNearbyStations(lat, lng) {
  const response = await axios.post(
    'https://places.googleapis.com/v1/places:searchText',
    {
      textQuery: 'Ather Grid Charging Station',
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 10000
        }
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.evChargeOptions'
      }
    }
  )
  return response.data.places || []
}

export async function getStationAvailability(placeId) {
  const response = await axios.get(
    PLACES_API_URL + '/' + placeId,
    {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'id,evChargeOptions'
      }
    }
  )
  const place = response.data
  const aggregation = place.evChargeOptions?.connectorAggregation?.[0]
  return {
    placeId: place.id,
    availableCount: aggregation?.availableCount ?? null,
    connectorCount: aggregation?.count ?? 1
  }
}
