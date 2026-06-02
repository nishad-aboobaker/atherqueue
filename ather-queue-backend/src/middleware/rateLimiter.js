import rateLimit from 'express-rate-limit'

export const joinQueueLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many requests from this IP, please try again later' }
})