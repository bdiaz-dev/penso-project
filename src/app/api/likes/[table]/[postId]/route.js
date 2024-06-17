import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import searchId from '@/libs/searchId'
// import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { pusher } from '@/libs/pusher'

export async function GET (req, { params }) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, table } = params

    const likesCount = table === 'likestoposts'

      ? (await prisma.likesToPosts.count({
        where: {
          postId: Number(postId)
        }
      }))

      : (await prisma.likesToComments.count({
        where: {
          postId: Number(postId)
        }
      }))

    const isLikedByUser = table === 'likestoposts'

      ? (await prisma.likesToPosts.findMany({
        where: {
          postId: Number(postId),
          userId: Number(await searchId(session.user.email))
        }
      }))

      : (await prisma.likesToComments.findMany({
        where: {
          postId: Number(postId),
          userId: Number(await searchId(session.user.email))
        }
      }))

    return NextResponse.json({ count: likesCount, isLiked: (isLikedByUser.length > 0) })
  } catch (error) {
    // return NextResponse.json({ count: 0 })
    return NextResponse.json(error.message)
  }
}

export async function POST (req, { params }) {
  const session = await getServerSession()
  try {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sessionId = await searchId(session.user.email)

    const body = await req.json()
    // console.log(body)

    const userId = await searchId(body.userEmail)

    if (sessionId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    console.log('>>  all right')

    const { postId, table } = params

    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'

    const res = (await prisma[tableInCamelCase].create({
      data: {
        postId: Number(postId),
        userId: Number(userId)
      }
    }))

    const likesCount = await prisma[tableInCamelCase].count({
      where: { postId: Number(postId) }
    })

    pusher.trigger(`${table}-likes-channel`, 'new-like', {
      postId: Number(postId),
      likesCount
    })

    return NextResponse.json({ count: res })
  } catch (error) {
    // return NextResponse.json({ count: 0 })
    return NextResponse.json(error.message)
  }
}

export async function DELETE (req, { params }) {
  const session = await getServerSession()
  try {
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const sessionId = await searchId(session.user.email)

    const body = await req.json()
    // console.log(body)

    const userId = await searchId(body.userEmail)

    if (sessionId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    console.log('>>  all right')

    const { postId, table } = params

    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'

    const likeId = await prisma[tableInCamelCase].findFirst({
      where: {
        postId: Number(postId),
        userId: Number(userId)
      },
      select: {
        id: true
      }
    })

    console.log(likeId)

    const res = await prisma[tableInCamelCase].delete({
      where: {
        id: Number(likeId.id)
      }
    })

    const likesCount = await prisma[tableInCamelCase].count({
      where: { postId: Number(postId) }
    })

    pusher.trigger(`${table}-likes-channel`, 'remove-like', {
      postId: Number(postId),
      likesCount
    })

    return NextResponse.json(`like to post: ${postId} removed`)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
