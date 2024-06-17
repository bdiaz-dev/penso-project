/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { signIn, useSession, signOut } from 'next-auth/react'
import searchId from '@/libs/searchId'
import { useEffect, useState } from 'react'

export default function NavBar () {
  const { data: session } = useSession()

  const [postedToday, setPostedToday] = useState(false)

  // if (session) {
  //   session.user.id = '0101'
  // }

  // console.log(session)

  useEffect(() => {
    if (!session) return
    const fetchPostedStatus = async () => {
      const { email } = await session?.user
      const userId = await searchId(email)
      await fetch(`/api/posts/isPostedToday/${userId}`)
        .then((res) => res.json())
        .then((bool) => {
          setPostedToday(bool)
        })
    }
    fetchPostedStatus()
  }, [session])

  return (
    <nav className='sticky top-0 z-50'>
      <ul
        className='bg-slate-500 flex justify-between items-center px-5 py-3 text-xl font-bold '
      >
        <li
          className='hover:underline'
        >
          <Link
            href={session ? '/wall' : '/'}
          >
            {session ? 'Wall' : 'Home'}
          </Link>
        </li>

        {/* --- Write Button --- */}
        {
          session &&
          <li
          >
            {
              postedToday
                ? <b>
                  Already posted today
                </b>
                : <Link
                  href={'/write'}
                >
                  Write
                </Link>
            }
          </li>
        }
        {/* --- --- */}

        <li
          className='hover:underline flex gap-x-2'
        >
          {/* <UserComponent /> */}
          {
            session?.user
              ? (

                <div className='flex gap-2 items-center cursor-pointer'>
                  <Link
                    href={'/dashboard'}
                  >
                    {session.user.name}
                  </Link>

                  <img
                    className='w-10 h-10 rounded-full'
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

                </div>)
              : (
                <button
                  onClick={() => signIn(undefined, { callbackUrl: '/welcome' })}
                >
                  Sing In
                </button>)
          }

        </li>
      </ul>
    </nav>
  )
}
