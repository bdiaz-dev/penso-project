import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'

export async function GET (req, { params }) {
  try {
    const hashtags = await prisma.hashtags.findMany({
      where: {
        tag: {
          contains: params.search,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })

    const result = hashtags.map(hashtag => ({
      tag: hashtag.tag,
      id: hashtag.id,
      count: hashtag._count.posts
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
