// app/api/posts/create/route.js
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/libs/prisma'
import { NextResponse } from 'next/server'

const secret = process.env.NEXTAUTH_SECRET

export async function POST (req) {
  const token = await getToken({ req, secret })

  // is token?
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // extract data
  const body = await req.json()
  const { text, userId: requestBodyUserId } = body
  console.log(text)
  // console.log('id is: ', requestBodyUserId)
  const tokenId = token.id

  // Verify ID
  if (tokenId !== requestBodyUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // update BIO
  try {
    const updatedBio = await prisma.users.update({
      where: {
        id: Number(requestBodyUserId)
      },
      data: {
        bio: text
      }
    })

    // up.message = ['Great!', 'Your diary post has been published', 'This is your day 2 writing non-stop']

    // response
    return NextResponse.json(updatedBio, { status: 201 })
  } catch (error) {
    return NextResponse.json(error.message, { status: 500 })
  }
}
