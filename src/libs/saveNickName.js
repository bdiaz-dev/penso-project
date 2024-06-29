export default function SaveNickName (id, nickName) {
  console.log(id, nickName)
  fetch('/api/users/saveNickName', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, nickName })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log(data)
    })
    .catch(error => {
      console.error('There was an error with the request:', error)
    })
}
