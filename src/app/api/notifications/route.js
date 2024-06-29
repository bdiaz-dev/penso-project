import { prisma } from '@/libs/prisma'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function GET (req) {
  const token = await getToken({ req })
  // const session = await getServerSession()
  const tokenUserId = Number(token.id)
  // console.log('userId on posts route: ', userId)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const userId = Number(searchParams.get('userId')) || undefined
  const actorId = Number(searchParams.get('actorId')) || undefined
  const type = searchParams.get('type') || undefined
  // const getReadParam = () => {
  //   if (searchParams.get('read') === 'true') {
  //     return true
  //   } else if (searchParams.get('read') === 'false') {
  //     return false
  //   } else {
  //     return undefined
  //   }
  // }
  // const read = await getReadParam()

  const whereClause = {}

  // Construir el whereClause dinámicamente
  if (userId) {
    whereClause.userId = userId
  }

  if (actorId) {
    whereClause.actorId = actorId
  }

  if (type) {
    whereClause.type = type
  }

  // if (read !== undefined) {
  //   whereClause.read = read
  // }

  try {
    const notifications = await prisma.notifications.findMany({
      where: whereClause,
      include: {
        actor: {
          select: {
            nickName: true,
            avatar: true
          }
        }
      }
    })

    // const result = hashtags.map(hashtag => ({
    //   tag: hashtag.tag,
    //   id: hashtag.id,
    //   count: hashtag._count.posts
    // }))

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}

export async function PUT (req) {
  const token = await getToken({ req })
  // const session = await getServerSession()
  const tokenUserId = Number(token.id)
  // console.log('userId on posts route: ', userId)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log(body)
  const userId = Number(body.userId)
  const read = body.read

  try {
    const updated = await prisma.notifications.updateMany({
      where: {
        userId
      },
      data: {
        read
      }
    })

    console.log(updated)

    return NextResponse.json('notifications readed')
  } catch (error) {
    console.log(error.message)
    return NextResponse.json(error.message)
  }
}

export async function DELETE (req) {
  const token = await getToken({ req })
  // const session = await getServerSession()
  const tokenUserId = Number(token.id)
  // console.log('userId on posts route: ', userId)

  if (!tokenUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  console.log(body)
  const userId = Number(body.userId)
  const notificationId = Number(body.notificationId)
  // const read = body.read

  try {
    const deleted = await prisma.notifications.delete({
      where: {
        userId,
        id: notificationId
      }
    })

    console.log(deleted)

    return NextResponse.json({ message: `notification ${notificationId} deleted`, ok: true })
  } catch (error) {
    console.log(error.message)
    return NextResponse.json(error.message)
  }
}
