import { prisma } from './prisma'

export default async function getUserData (id) {
  // const id = Number(stringId)
  console.log(id)
  try {
    const res = await prisma.users.findUnique({
      where: {
        id
      }
    })

    // const userData = await res.json()
    return res

  } catch (error) {
    return
  }
}