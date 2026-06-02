export function getEstimatedWait(queueLength) {
  const avgSessionMinutes = 60
  return queueLength * avgSessionMinutes
}

export function formatWaitTime(minutes) {
  if (minutes < 60) return minutes + ' mins'
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hrs + 'h ' + (mins > 0 ? mins + 'm' : '')
}

export function getStatusColor(availableCount) {
  if (availableCount === undefined || availableCount === null) return 'gray'
  return availableCount > 0 ? 'green' : 'red'
}
