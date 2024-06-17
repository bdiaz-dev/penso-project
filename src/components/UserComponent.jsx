/* eslint-disable @next/next/no-img-element */
// 'use client'
import { signIn, useSession, getSession } from 'next-auth/react'
import { prisma } from '../libs/prisma'
import Link from 'next/link'
// import { useEffect, useState } from 'react'


export async function UserComponent () {

  const session = await getSession

  console.log(session.user.email)

  // const { data: session } = useSession()
  // const [user, setUser] = useState()

  // useEffect(() => {
  //   if (session) {
  //     prisma.users.findUnique({
  //       where: {
  //         email: session.user.email
  //       }
  //     })
  //   }
  // })

  // signIn()


  // console.log(session)

  // const user = await prisma.users.findUnique({
  //   where: {
  //     email: session.user.email
  //   }
  // })

  console.log(user)

  if (user) {
    console.log('user exists')
  } else {
    console.log('new user !')
  }

  return (
    <div>
      {
        session?.user ? (

          <div className='flex gap-2 items-center cursor-pointer'>
            <Link
              href={'/dashboard'}
            >
              {session.user.name}
            </Link>

            <img
              className='w-10 h-10'
              src={session.user.image}
              alt='user_avatar'
            />

            <button
              onClick={async () => {
                await signOut({
                  callbackUrl: '/'
                })
              }}
              className='bg-blue-700 px-5 py-2 rounded'
            >
              Log Out
            </button>


          </div>
        )
          :
          (
            <button
              onClick={() => signIn()}
            >
              Sing In
            </button>
          )
      }
    </div>
  )

}

export function handleNewUser () {

}