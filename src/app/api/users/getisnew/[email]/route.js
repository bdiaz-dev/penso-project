import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'

export async function GET (request, { params }) {
  try {
    const isNewUser = await prisma.users.findUnique({
      where: {
        email: params.email
      },
      select: {
        isNewUser: true
      }
    })
    return NextResponse.json(isNewUser ? isNewUser.isNewUser : false)
  } catch (error) {
    return NextResponse.json(error.message)
  }
}
