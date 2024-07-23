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

    const followingPosts = await prisma.posts.findMany({
      where: {
        userId: {
          in: followingIds
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
            comments: true,
            pins: true
          }
        },
        likes: { where: { userId } },
        pins: {
          where: { userId }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedFollowingPosts = followingPosts.map(post => ({
      ...post,
      isFollowing: true
    }))

    const hasMore = formattedFollowingPosts.length === limit
    const noFollowingUsers = following.length < 1

    return NextResponse.json({ posts: formattedFollowingPosts, hasMore, noFollowingUsers })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
