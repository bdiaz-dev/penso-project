// import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'
// import searchId from '@/libs/searchId'
// import { Sono } from 'next/font/google'
import { getServerSession } from 'next-auth/next'

export async function GET (req, { params }) {
  try {
    // const token = await getToken({ req, secret })

    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // const body = await req.json()
    // const { text, userId: requestBodyUserId, tags: hashtags, userEmail } = body // Modificado
    // console.log('id is: ', requestBodyUserId)
    // const tokenId = token.id

    // Verify ID
    // if (tokenId !== requestBodyUserId) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // today posted?
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(today.getDate() + 1)

    // const userId = await searchId(userEmail)

    const { userId } = await params

    const postsToday = await prisma.posts.count({
      where: {
        userId: Number(userId),
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (postsToday > 0) {
      return NextResponse.json(true)
    } else {
      return NextResponse.json(false)
    }
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
