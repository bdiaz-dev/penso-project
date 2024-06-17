import { prisma } from './prisma'

export default async function checkNewUser (id) {
  try {
    const isNewUser = await prisma.users.findUnique({
      where: {
        id
      },
      select: {
        nickName: true
      }
    })

    if (nickName != null) {
      console.log('NEW USER')
      return true
    } else {
      console.log('NOT A NEW USER')
      return false
    }

  } catch (error) {
    return (error.message)
  }
}