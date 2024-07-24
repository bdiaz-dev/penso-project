import { prisma } from '@/libs/prisma'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET (req) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const searchText = searchParams.get('input') || null
    // const page = parseInt(searchParams.get('page')) || 1
    // const limit = parseInt(searchParams.get('limit')) || 5
    // const offset = (page === 2) ? 2 : (page - 1) * limit
    console.log(searchText)

    if (!searchText) return NextResponse.json({ error: 'search text needed' }, { status: 401 })

    const users = await prisma.users.findMany({
      where: {
        nickName: {
          contains: searchText,
          mode: 'insensitive'
        }
      },
      select: {
        avatar: true,
        nickName: true,
        streakCount: true,
        _count: { select: { followers: true } }
      }
    })
    console.log(users)

    const hashtags = await prisma.hashtags.findMany({
      where: {
        tag: {
          contains: searchText,
          mode: 'insensitive'
        }
      },
      select: {
        tag: true,
        _count: { select: { posts: true } }
      }
    })

    return NextResponse.json({ users, hashtags })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
