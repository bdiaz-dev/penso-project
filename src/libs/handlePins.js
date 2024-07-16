const getPins = async ({ page, userId }) => {
  const res = await fetch(`/api/pins?userId=${userId}&page=${page}&limit=5`)
  const comments = await res.json()
  return comments
}

const newPin = async ({ userId, postId }) => {
  const res = await fetch('/api/pins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, postId })
  })
  const data = await res.json()
  console.log(data.message)
  return data
}

const deletePin = async ({ userId, postId }) => {
  const res = await fetch('/api/pins', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, postId })
  })
  const data = await res.json()
  console.log(data.message)
  return data
}

const postPins = async ({ userId, postId }) => {
  const res = await fetch(`/api/pins/count?userId=${userId}&postId=${postId}`)
  const data = await res.json()
  return data
}

export {
  getPins,
  newPin,
  deletePin,
  postPins
}
