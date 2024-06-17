import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
// import { getServerSession } from 'next-auth/next'

export async function PUT (req, res) {
  // const session = await getServerSession()

  const { id, nickName } = await req.json()

  try {
    const nickAlreadyUse = await prisma.users.findUnique({
      where: {
        nickName
      }
    })
    if (nickAlreadyUse) {
      throw new Error('This nickname already exists')
    }
  } catch (error) {
    return NextResponse.json(error.message)
  }

  try {
    const updatedUser = await prisma.users.update({
      where: {
        id: Number(id)
      },
      data: {
        nickName
        // avatar: session.user.image
      }
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
