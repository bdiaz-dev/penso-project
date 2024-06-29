import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { getToken } from 'next-auth/jwt'
import { getServerSession } from 'next-auth'
import { pusher } from '@/libs/pusher'

export async function GET (req, { params }) {
  try {
    const token = await getToken({ req })
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
            userId: Number(token.id)
          }
        }))

      : (await prisma.likesToComments.findMany({
          where: {
            postId: Number(postId),
            userId: Number(token.id)
          }
        }))

    return NextResponse.json({ count: likesCount, isLiked: (isLikedByUser.length > 0) })
  } catch (error) {
    return NextResponse.json(error.message)
  }
}

export async function POST (req, { params }) {
  try {
    const token = await getToken({ req })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, table } = params

    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'
    const notificationType = (table === 'likestoposts') ? 'LIKE_POST' : 'LIKE_COMMENT'

    const post = await prisma.posts.findFirst({
      where: {
        id: Number(postId)
      },
      select: {
        userId: true
      }
    })
    const { userId: postOwner } = post
    const isSameUser = postOwner === Number(token.id)
    const res = isSameUser
      ? await prisma[tableInCamelCase].create({
        data: {
          postId: Number(postId),
          userId: Number(token.id)
        }
      })
      : await prisma[tableInCamelCase].create({
        data: {
          postId: Number(postId),
          userId: Number(token.id),
          notifications: {
            create: {
              type: notificationType,
              userId: postOwner,
              actorId: Number(token.id),
              postId: notificationType === 'LIKE_POST' ? Number(postId) : null,
              commentId: notificationType === 'LIKE_COMMENT' ? Number(postId) : null
            }
          }
        }
      })

    const likesCount = await prisma[tableInCamelCase].count({
      where: { postId: Number(postId) }
    })

    pusher.trigger(`${table}-likes-channel`, 'new-like', {
      postId: Number(postId),
      likesCount
    })
    if (!isSameUser) {
      pusher.trigger('notifications-channel', 'new-notification', {
        userId: Number(postOwner)
      })
    }

    return NextResponse.json({ count: res })
  } catch (error) {
    return NextResponse.json(error.message)
  }
}

export async function DELETE (req, { params }) {
  try {
    const token = await getToken({ req })
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { postId, table } = params

    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'

    const likeId = await prisma[tableInCamelCase].findFirst({
      where: {
        postId: Number(postId),
        userId: Number(token.id)
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
    console.log('deleted ', res.id)

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
