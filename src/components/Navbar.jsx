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
  const [isShowingMenu, setIsShowingMenu] = useState(false)

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
    <nav className='sticky top-0 z-50 items-center'>
      <b className='absolute left-4 top-3 text-xl'>
        PensoProject
      </b>
      <ul
        className={`bg-slate-700 text-white p-2 fixed top-20 ${isShowingMenu ? 'right-4' : 'left-full'}`}
        onMouseLeave={() => setIsShowingMenu(false)}>
        <li>
          <Link href={`/user/${nick}`} onClick={() => setIsShowingMenu(false)}>
            Profile
          </Link>
        </li>
        <li>
          <Link href={'/myPins'} onClick={() => setIsShowingMenu(false)}>
            My Pins
          </Link>
        </li>
        <li>
          <button onClick={async () => { await signOut({ callbackUrl: '/' }); setIsShowingMenu(false) }}
            className='bg-blue-700 px-5 py-2 rounded'>
            Log Out
          </button>
        </li>
      </ul>
      <ul
        className='bg-slate-500 flex justify-center items-center px-5 py-3 text-xl font-bold gap-4'
      >
        <li
          className='hover:underline'>
          <Link href={session ? '/wall' : '/'}>🏠</Link>
        </li>

        {/* --- Write Button --- */}
        {
          userId &&
          <li>
            {
              postedToday
                ? <b>✅</b>
                : <Link href={'/write'}>📝</Link>
            }
          </li>
        }
        {
          userId &&
          <li>
            <NotificationBell userId={userId} />
          </li>
        }
        {/* --- --- */}

        <div
          className=' flex gap-x-2 absolute right-4'
        >
          {/* <UserComponent /> */}
          {
            session?.user
              ? (

                <div onClick={() => { setIsShowingMenu(!isShowingMenu) }} className='hover:underline flex gap-2 items-center cursor-pointer'>
                  <b>{nick}</b>
                  <img
                    className='w-10 h-10 rounded-full'
                    src={session.user.image}
                    alt='user_avatar' />
                </div>)
              : (
                <button
                  onClick={() => signIn(undefined, { callbackUrl: '/welcome' })}>
                  Sing In
                </button>)
          }

        </div>
      </ul>
    </nav>
  )
}
