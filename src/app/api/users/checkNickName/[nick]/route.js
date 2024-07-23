import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'

export async function GET (request, { params }) {
  const { nick } = params
  console.log(nick)
  const res = await prisma.users.findFirst({
    where: {
      nickName: {
        equals: nick,
        mode: 'insensitive'
      }
    }
  })
  if (res) {
    return NextResponse.json(true)
  } else {
    return NextResponse.json(false)
  }
}
