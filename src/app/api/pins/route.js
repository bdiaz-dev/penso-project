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
  const { userId: requestBodyUserId, postId } = body
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const searchPin = await prisma.pins.findMany({
      where: {
        userId: Number(requestBodyUserId),
        postId: Number(postId)
      }
    })
    if (searchPin.length > 0) throw new Error('this post is already pined by user')
    await prisma.pins.create({
      data: {
        postId,
        userId: Number(requestBodyUserId)
      }
    })

    pusher.trigger('notifications-channel', 'new-notification', {
      postId: Number(postId),
      userId: Number(requestBodyUserId)
    })
    return NextResponse.json({ message: 'post saved on pins', ok: true }, { status: 201 })
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
  const { userId: requestBodyUserId, postId } = body // Modificado
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await prisma.pins.deleteMany({
      where: {
        postId: Number(postId),
        userId: Number(requestBodyUserId)
      }
    })

    return NextResponse.json({ message: `pin of post ${postId} by user ${requestBodyUserId} deleted`, ok: true }, { status: 201 })
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
    const requestBodyUserId = parseInt(searchParams.get('userId')) || null
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    if (!requestBodyUserId) return NextResponse.json({ error: 'user id needed' }, { status: 401 })

    // const postsIds = await prisma.pins.findMany({
    //   where: { userId: requestBodyUserId },
    //   select: { postId: true }
    // })

    const savedPosts = await prisma.posts.findMany({
      where: {
        pins: { some: { userId: requestBodyUserId } }
      },
      include: {
        user: {
          select: {
            avatar: true,
            nickName: true,
            email: true,
            id: true
          }
        },
        hashtags: {
          include: {
            hashtag: true
          }
        },
        comments: {
          take: 2,
          include: {
            user: {
              select: {
                avatar: true,
                nickName: true,
                email: true,
                id: true
              }
            },
            _count: {
              select: { likes: true }
            },
            likes: { where: { userId: Number(userId) } }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            pins: true
          }
        },
        likes: { where: { userId } },
        pins: { where: { userId } }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const hasMore = savedPosts.length === limit

    return NextResponse.json({ posts: savedPosts, hasMore })
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
