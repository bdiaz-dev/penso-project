import { prisma } from '@/libs/prisma'

import searchId from '@/libs/searchId'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import checkProvider from '@/libs/checkProvider'
// import { getServerSession } from 'next-auth/next'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn ({ user, account, profile, email, credentials }) {
      try {
        // console.log(user)
        await searchId(user.email, user.name, account.provider, user.image)
        const userProvider = await checkProvider(user.email)

        if (userProvider !== account.provider) {
          return '/errors/providermatch'
        }
        return true
      } catch (error) {
        console.error('Error in signIn callback:', error)
        return false
      }

      // console.log(user, account)

      // await searchId(user.email, user.name, account.provider)
      // const userProvider = await checkProvider(user.email)

      // console.log(userProvider)
      // console.log(account.provider)

      // if (userProvider != account.provider) {

      //   return '/errors/providermatch'
      // }

      // return true
    },

    async jwt ({ token, user, account }) {
      if (user) {
        const userInDb = await prisma.users.findUnique({
          where: { email: user.email }
        })
        // console.log(userInDb)
        token.id = userInDb.id
      }
      return token
    },

    async session ({ session, token, user }) {
      // if (token) {
      session.user.id = token.id
      // console.log('sesion: ', session)
      // }
      return session
    }
  }
})

export { handler as GET, handler as POST }
