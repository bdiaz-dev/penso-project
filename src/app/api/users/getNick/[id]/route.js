import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET (request, { params }) {
  try {
    const userNick = await prisma.users.findUnique({
      where: {
        id: Number(params.id)
      },
      select: {
        nickName: true
      }
    })
    return NextResponse.json(userNick ? userNick.nickName : userNick)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
