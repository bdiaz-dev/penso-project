export async function getNotifications ({ userId, actorId, type }) {
  if (!userId) return
  const params = {
    actorId: actorId ? `actorId=${actorId}&` : '',
    type: type ? `type=${type}&` : ''
  }
  const res = await fetch(`/api/notifications?userId=${userId}&${params.actorId}${params.type}`)
  const nots = await res.json()
  return nots
}

export async function deleteNotification ({ userId, notificationId }) {
  const res = await fetch('/api/notifications', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, notificationId })
  })
  const response = await res.json()
  return response
}
