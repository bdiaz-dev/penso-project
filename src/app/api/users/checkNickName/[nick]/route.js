import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'

export async function GET (request, { params }) {
  const res = await prisma.users.findUnique({
    where: {
      nickName: params.nick
    }
  })
  if (res) {
    return NextResponse.json(true)
  } else {
    return NextResponse.json(false)
  }
}
