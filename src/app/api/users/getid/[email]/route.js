import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET (request, { params }) {
  try {
    const userId = await prisma.users.findUnique({
      where: {
        email: params.email
      },
      select: {
        id: true
      }
    })
    return NextResponse.json(userId ? userId.id : userId)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
