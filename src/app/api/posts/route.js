// app/api/posts/create/route.js
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'
import searchId from '@/libs/searchId'
import { getServerSession } from 'next-auth/next'

const secret = process.env.NEXTAUTH_SECRET

export async function POST (req) {
  const token = await getToken({ req, secret })

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { text, userId: requestBodyUserId, tags: hashtags } = body // Modificado
  console.log('id is: ', requestBodyUserId)
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // today posted?
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(today.getDate() + 1)

  // const userId = await searchId(userEmail)

  const postsToday = await prisma.posts.count({
    where: {
      userId: Number(requestBodyUserId),
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  if (postsToday > 0) {
    return NextResponse.json({ error: 'Sorry, you have already posted today. Come back tomorrow.' }, { status: 403 })
  }

  // const isPostedToday = await fetch(`/api/posts/isPostedToday/${requestBodyUserId}`)

  // if (isPostedToday) {
  //   return NextResponse.json({ error: 'Sorry, you have already posted today. Come back tomorrow.' }, { status: 403 })
  // }

  // New Post
  try {
    const newPost = await prisma.posts.create({
      data: {
        content: text,
        userId: Number(requestBodyUserId)
      }
    })

    const postHashtagsData = []

    // is id null?
    for (const tag of hashtags) {
      if (tag.id === null) {
        // new hashtag
        const newHashtag = await prisma.hashtags.create({
          data: {
            tag: tag.tag
          }
        })
        postHashtagsData.push({
          postId: newPost.id,
          hashtagId: newHashtag.id
        })
      } else {
        postHashtagsData.push({
          postId: newPost.id,
          hashtagId: tag.id
        })
      }
    }

    if (postHashtagsData.length > 0) {
      await prisma.postHashtag.createMany({
        data: postHashtagsData
      })
    }

    newPost.message = ['Great!', 'Your diary post has been published', 'This is your day 2 writing non-stop']
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    return NextResponse.json(error.message, { status: 500 })
  }
}

export async function GET (request) {
  try {
    const session = await getServerSession()
    const userId = Number(await searchId(session.user.email))
    console.log('userId on posts route: ', userId)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
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
        user: true,
        hashtags: {
          include: {
            hashtag: true
          }
        },
        likes: true
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const otherPosts = await prisma.posts.findMany({
      where: {
        userId: {
          notIn: [userId, ...followingIds]
        }
      },
      include: {
        user: true,
        hashtags: {
          include: {
            hashtag: true

          }
        },
        likes: true
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

    const formattedOtherPosts = otherPosts.map(post => ({
      ...post,
      isFollowing: false
    }))

    const combinedPosts = [...formattedFollowingPosts, ...formattedOtherPosts].slice(0, limit)
    const hasMore = combinedPosts.length === limit

    // console.log(combinedPosts)

    return NextResponse.json({ posts: combinedPosts, hasMore })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
