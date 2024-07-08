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
    const profileUserId = parseInt(searchParams.get('userId')) || null
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    if (!profileUserId) {
      return NextResponse.json({ error: 'Profile user id needed' }, { status: 500 })
    }

    const profilePosts = await prisma.posts.findMany({
      where: {
        userId: Number(profileUserId)
      },
      include: {
        user: true,
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

    const hasMore = profilePosts.length === limit

    return NextResponse.json({ posts: profilePosts, hasMore })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
