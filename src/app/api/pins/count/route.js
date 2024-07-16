import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'
// import { pusher } from '@/libs/pusher'

// const secret = process.env.NEXTAUTH_SECRET

export async function GET (req) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestBodyUserId = parseInt(searchParams.get('userId')) || null
    const postId = parseInt(searchParams.get('postId')) || null

    if (!requestBodyUserId) return NextResponse.json({ error: 'user id needed' }, { status: 401 })

    const countPins = await prisma.pins.count({
      where: { postId }
    })
    const userPin = await prisma.pins.findMany({
      where: {
        userId: requestBodyUserId,
        postId
      }
    })

    const isPined = userPin.length > 0

    return NextResponse.json({ countPins, isPined })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
