import 'dotenv/config'
import Redis from 'ioredis'

const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  password: process.env.UPSTASH_REDIS_TOKEN,
  maxRetriesPerRequest: null,
  tls: {}
})

redis.on('connect', () => console.log('Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))

export default redis
