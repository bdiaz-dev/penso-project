import { prisma } from '@/libs/prisma'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET (req, { params }) {
  try {
    const token = await getToken({ req })
    const userId = Number(token.id)

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = params

    const post = await prisma.posts.findFirst({
      where: { id: Number(postId) },
      include: {
        user: true,
        hashtags: {
          include: {
            hashtag: true

          }
        },
        _count: { select: { likes: true } },
        likes: { where: { userId } }
      }
    })

    return NextResponse.json({ post, ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
