const getComments = async ({ page, postId }) => {
  const res = await fetch(`/api/comment?postId=${postId}&page=${page}&limit=2`)
  const comments = await res.json()
  return comments
}

const newComment = async ({ text, userId, postId }) => {
  const res = await fetch('/api/comment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, userId, postId })
  })
  const data = await res.json()
  console.log(data.message)
  return data
}

const editComment = async ({ text, userId, commentId }) => {
  const res = await fetch('/api/comment', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, userId, commentId })
  })
  const data = await res.json()
  console.log(data.message)
  return data
}

const deleteComment = async ({ userId, commentId }) => {
  const res = await fetch('/api/comment', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, commentId })
  })
  const data = await res.json()
  console.log(data.message)
  return data
}

export {
  getComments,
  newComment,
  editComment,
  deleteComment
}
