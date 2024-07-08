// app/api/posts/create/route.js
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'

export async function GET (req) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const following = await prisma.follows.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })
    const followingIds = following.map(f => f.followingId)

    const explorePosts = await prisma.posts.findMany({
      where: {
        userId: {
          notIn: [userId, ...followingIds]
        }
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
            comments: true
          }
        },
        likes: { where: { userId } }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedExplorePosts = explorePosts.map(post => ({
      ...post,
      isFollowing: false
    }))

    const hasMore = formattedExplorePosts.length === limit

    return NextResponse.json({ posts: formattedExplorePosts, hasMore })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
