import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'
import { pusher } from '@/libs/pusher'

const secret = process.env.NEXTAUTH_SECRET

export async function POST (req) {
  const token = await getToken({ req, secret })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { text, userId: requestBodyUserId, postId } = body
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const newComment = await prisma.comments.create({
      data: {
        postId,
        content: text,
        userId: Number(requestBodyUserId)
      }
    })

    const userNick = await prisma.users.findFirst({
      where: {
        id: Number(requestBodyUserId)
      },
      select: {
        nickName: true
      }
    })

    pusher.trigger('notifications-channel', 'new-notification', {
      postId: Number(postId),
      userId: Number(requestBodyUserId)
    })
    return NextResponse.json({ message: 'comment published', ok: true, commentId: newComment.id, userNick: userNick.nickName }, { status: 201 })
  } catch (error) {
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function DELETE (req) {
  // const session = await getServerSession()
  const token = await getToken({ req, secret })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId: requestBodyUserId, commentId } = body // Modificado
  console.log('id is: ', requestBodyUserId)
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await prisma.comments.delete({
      where: {
        id: Number(commentId)
      }
    })

    await prisma.likesToComments.deleteMany({
      where: {
        commentId
      }
    })

    return NextResponse.json({ message: `post ${commentId} deleted`, ok: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function GET (req) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const postId = parseInt(searchParams.get('postId')) || null
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    if (!postId) return NextResponse.json({ error: 'post id needed' }, { status: 401 })

    const comments = await prisma.comments.findMany({
      where: {
        postId
      },
      include: {
        user: {
          select: {
            avatar: true,
            id: true,
            nickName: true
          }
        },
        _count: { select: { likes: true } },
        likes: { where: { userId } }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })
    const hasMore = comments.length === limit

    return NextResponse.json({ comments, hasMore })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT (req) {
  const token = await getToken({ req, secret })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { commentId, text, userId: requestBodyUserId } = body
  console.log('id is: ', requestBodyUserId)
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const updatedComment = await prisma.comments.update({
      where: {
        id: Number(commentId)
      },
      data: {
        content: text
      },
      select: {
        updatedAt: true
      }
    })
    return NextResponse.json({ message: `comment ${commentId} edited`, ok: true, updatedAt: updatedComment.updatedAt }, { status: 201 })
  } catch (error) {
    return NextResponse.json(error.message, { status: 500 })
  }
}
