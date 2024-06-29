export async function newFollow ({ userId, followedId }) {
  const res = await fetch('/api/follow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, followedId })
  })
  const response = await res.json()
  return response
}

export async function deleteFollow ({ userId, followedId }) {
  const res = await fetch('/api/follow', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, followedId })
  })
  const response = await res.json()
  return response
}

export async function askFollow ({ userId, followingId }) {
  const res = await fetch(`/api/follow?userId=${userId}&followingId=${followingId}`)
  const response = await res.json()
  console.log(response)
  return response
}
