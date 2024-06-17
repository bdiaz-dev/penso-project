import { prisma } from './prisma'

export default async function checkProvider (email) {

  const res = await prisma.users.findUnique({
    where: {
      email
    },
    select: {
      provider: true
    }
  })

  return (res ? res.provider : res)
}