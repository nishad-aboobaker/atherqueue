import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import stationsRouter from './routes/stations.js'
import queueRouter from './routes/queue.js'
import authRouter from './routes/auth.js'
import { recoverActiveQueues } from './workers/stationMonitor.js'
import { joinQueueLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/stations', stationsRouter)
app.use('/api/queue/join', joinQueueLimiter)
app.use('/api/queue', queueRouter)

const PORT = process.env.PORT || 5000

connectDB().then(async () => {
  await recoverActiveQueues()
  app.listen(PORT, () => console.log('Server running on port ' + PORT))
})