export default async function getNick (userId) {
  const res = await fetch(`http://localhost:3000/api/users/getNick/${userId}`)
  const nick = await res.json()

  return nick
}
