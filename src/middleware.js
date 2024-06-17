// export { default } from "next-auth/middleware"

import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const secret = process.env.NEXTAUTH_SECRET

export async function middleware (req) {
  const token = await getToken({ req, secret })
  if (!token) return NextResponse.redirect(new URL('/api/auth/signin', req.url))

  req.user = token
  return NextResponse.next()
}

export const config = {
  matcher: ['/welcome', '/api/']
}
