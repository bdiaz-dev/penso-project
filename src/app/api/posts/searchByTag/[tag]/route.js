import { prisma } from '@/libs/prisma'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET (req, { params }) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)
    const { tag } = params

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = (page - 1) * limit

    const searchedPosts = await prisma.posts.findMany({
      where: {
        hashtags: {
          some: {
            hashtag: {
              tag: String(tag)
            }
          }
        }
      },
      include: {
        user: true,
        hashtags: {
          include: {
            hashtag: true

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
    const hasMore = searchedPosts.length === limit

    // const combinedPostsWithLikesInfo = combinedPosts.map(post => {
    //   const likesCount = post._count.likes;
    //   const isLikedByUser = post.likes.length > 0})

    // console.log(combinedPosts)

    return NextResponse.json({ posts: searchedPosts, hasMore })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
