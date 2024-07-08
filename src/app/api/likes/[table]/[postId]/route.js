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
    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'
    const tableToSearchId = (tableInCamelCase === 'likesToPosts' ? { postId: Number(postId) } : { commentId: Number(postId) })

    const likesCount = await prisma[tableInCamelCase].count({
      where: { ...tableToSearchId }
    })

    const isLikedByUser = await prisma[tableInCamelCase].findMany({
      where: { ...tableToSearchId, userId: Number(token.id) }
    })

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

    const tableToSearchUser = (table === 'likestoposts') ? 'posts' : 'comments'
    const tableInCamelCase = (table === 'likestoposts') ? 'likesToPosts' : 'likesToComments'
    const notificationType = (table === 'likestoposts') ? 'LIKE_POST' : 'LIKE_COMMENT'

    const ct = await prisma[tableToSearchUser].findFirst({
      where: {
        id: Number(postId)
      }
    })

    const { userId: postOwner } = ct
    const isSameUser = postOwner === Number(token.id)
    const tableToSearchId = (tableInCamelCase === 'likesToPosts' ? { postId: Number(postId) } : { commentId: Number(postId) })
    const res = isSameUser
      ? await prisma[tableInCamelCase].create({
        data: { userId: Number(token.id), ...tableToSearchId }
      })
      : await prisma[tableInCamelCase].create({
        data: {
          userId: Number(token.id),
          notifications: {
            create: {
              type: notificationType,
              userId: postOwner,
              actorId: Number(token.id),
              postId: notificationType === 'LIKE_POST' ? Number(postId) : Number(ct.postId),
              commentId: notificationType === 'LIKE_COMMENT' ? Number(postId) : null
            }
          },
          ...tableToSearchId
        }
      })

    // const likesCount = await prisma[tableInCamelCase].count({
    //   where: { ...tableToSearchId }
    // })

    // pusher.trigger(`${table}-likes-channel`, 'new-like', {
    //   ...tableToSearchId,
    //   likesCount
    // })
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
    const tableToSearchId = (tableInCamelCase === 'likesToPosts' ? { postId: Number(postId) } : { commentId: Number(postId) })

    const likeId = await prisma[tableInCamelCase].findFirst({
      where: {
        ...tableToSearchId,
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

    // const likesCount = await prisma[tableInCamelCase].count({
    //   where: { ...tableToSearchId }
    // })

    // pusher.trigger(`${table}-likes-channel`, 'remove-like', {
    //   postId: Number(postId),
    //   likesCount
    // })

    return NextResponse.json(`like to post: ${postId} removed`)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
