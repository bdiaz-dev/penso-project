/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'
import { signIn, useSession, signOut } from 'next-auth/react'
import searchId from '@/libs/searchId'
import { useEffect, useState } from 'react'
import { getPusherJsInstance } from '@/libs/pusher'
import getNick from '@/libs/getNick'
import NotificationBell from './NotificationBell'

export default function NavBar () {
  const { data: session } = useSession()
  const [userId, setUserId] = useState(null)
  const [postedToday, setPostedToday] = useState(false)
  const [nick, setNick] = useState(null)

  useEffect(() => {
    if (!session) return
    const fetchPostedStatus = async () => {
      if (!userId) {
        const { email } = await session?.user
        const userId = await searchId(email)
        const nick = await getNick(userId)
        setUserId(userId)
        setNick(nick)
        await fetch(`/api/posts/isPostedToday/${userId}`)
          .then((res) => res.json())
          .then((bool) => {
            setPostedToday(bool)
          })
      }
    }
    fetchPostedStatus()
  }, [session, userId])

  useEffect(() => {
    // eslint-disable-next-line new-cap

    const pusher = getPusherJsInstance()

    const channel = pusher.subscribe('posts-channel')

    const updatePostedToday = (data) => {
      if (data.userId === Number(userId)) {
        setPostedToday(true)
      }
    }

    channel.bind('today-has-posted', (data) => updatePostedToday(data))

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId])

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
          userId &&
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
                    href={`/user/${nick}`}
                  >
                    {nick}
                  </Link>

                  <img
                    className='w-10 h-10 rounded-full'
                    src={session.user.image}
                    alt='user_avatar'
                  />

                  <NotificationBell userId={userId} />

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
