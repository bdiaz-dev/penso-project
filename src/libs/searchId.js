import { prisma } from './prisma'

export default async function searchId (email, userName, provider, avatar) {
  // console.log(`  -->> searching id of ${email} whith userName ${userName}`)
  const res = await fetch(`http://localhost:3000/api/users/getid/${email}`)
  const id = await res.json()

  if (id === null) {
    const res = await prisma.users.create({
      data: {
        userName,
        email,
        provider,
        avatar
      }
    })
    return JSON.stringify(res)
  } else {
    return JSON.stringify(id)
  }
}
