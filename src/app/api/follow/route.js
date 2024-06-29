import { prisma } from '@/libs/prisma'
import { pusher } from '@/libs/pusher'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET (req) {
  const token = await getToken({ req })
  const tokenUserId = Number(token.id)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get('userId')) || undefined
  const followingId = Number(searchParams.get('followingId')) || undefined

  try {
    const followRes = await prisma.follows.findFirst({
      where: {
        followerId: userId,
        followingId
      }
    })

    return NextResponse.json(followRes)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}

export async function POST (req) {
  const token = await getToken({ req })
  const tokenUserId = Number(token.id)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log(body)
  const userId = Number(body.userId)
  const followedId = Number(body.followedId)

  try {
    const followed = await prisma.follows.create({
      data: {
        followerId: userId,
        followingId: followedId,
        Notifications: {
          create: {
            type: 'FOLLOW',
            actorId: userId,
            userId: followedId
          }
        }
      }
    })

    console.log(followed)

    pusher.trigger('notifications-channel', 'new-notification', {
      userId: Number(followedId)
    })

    return NextResponse.json({ message: `user ${userId} now is following user ${followedId}`, ok: true })
  } catch (error) {
    console.log(error.message)
    return NextResponse.json(error.message)
  }
}

export async function DELETE (req) {
  const token = await getToken({ req })
  const tokenUserId = Number(token.id)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log(body)
  const userId = Number(body.userId)
  const followedId = Number(body.followedId)

  try {
    const noFollowed = await prisma.follows.deleteMany({
      where: {
        followerId: userId,
        followingId: followedId
      }
    })

    console.log(noFollowed)

    return NextResponse.json({ message: `user ${userId} IS NOT following user ${followedId}`, ok: true })
  } catch (error) {
    console.log(error.message)
    return NextResponse.json(error.message)
  }
}
