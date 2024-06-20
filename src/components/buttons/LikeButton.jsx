/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
// import pusherJs from 'pusher-js'
import { getPusherJsInstance } from '@/libs/pusher'

export default function LikeButton ({ table, id, isLikedBool, likesCount }) {
  const session = useSession()
  // console.log('isLikeBool: ', isLikedBool)
  // console.log('likesCount: ', likesCount)
  // console.log(session)
  const userEmail = session?.data?.user?.email
  // console.log('sesion en likebutton', userEmail)

  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(likesCount)
  const [isLiked, setIsLiked] = useState(isLikedBool)

  const getLikes = useCallback(async (table, id) => {
    // console.log('sesion en likebutton', session)
    if (!table || !id) return
    if (loading) return

    try {
      setLoading(true)

      const res = await fetch(`/api/likes/${table}/${id}`)
      const data = await res.json()

      // console.log(data)

      setCount(await data.count)
      setIsLiked(await data.isLiked)
    } catch (error) {
      console.log(error.message)
    }

    setLoading(false)
  }, [])

  // useEffect(() => {
  //   getLikes(table, id)
  // }, [getLikes, table, id])

  useEffect(() => {
    // eslint-disable-next-line new-cap
    // const pusher = new pusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    //  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    // })

    const pusher = getPusherJsInstance()

    const channel = pusher.subscribe(`${table}-likes-channel`)

    const updateCount = (data) => {
      if (data.postId === id) {
        setCount(data.likesCount)
      }
    }

    channel.bind('new-like', (data) => updateCount(data))
    channel.bind('remove-like', (data) => updateCount(data))

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [id])

  // console.log(likes)

  const handleLike = useCallback(async (table, id, method) => {
    if (!table || !id) return
    if (loading) return

    setLoading(true)
    const res = await fetch(`/api/likes/${table}/${id}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail })
    })

    getLikes(table, id)

    const data = await res.json()
    console.log(data)
    // setLoading(false)
  }, [])

  const handleClickLike = () => {
    handleLike(table, id, (isLiked ? 'DELETE' : 'POST'))
  }

  // useEffect(() => {
  //   getLikes(table, id)

  //   // const interval = setInterval(() => {
  //   //   getLikes(table, id)
  //   // }, 10000)

  //   // return () => clearInterval(interval)
  // }, [getLikes, table, id])

  const normalButton = <button
    className={isLiked ? 'bg-green-600 p-2 rounded mt-4' : 'bg-blue-600 p-2 rounded mt-4'}
    onClick={handleClickLike}
  >
    <span>👍 </span>
    {count}
  </button>

  const loadingButton = <button
    className={'bg-slate-600 p-2 rounded mt-4 text-slate-400'}
  >
    <span>👍 </span>
    Loading
  </button>

  return (
    <div>
      {
        !loading
          ? normalButton
          : loadingButton
      }
      {/* <button
        className={isLiked ? 'bg-green-600 p-2 rounded mt-4' : 'bg-blue-600 p-2 rounded mt-4'}
        onClick={handleClickLike}
      >
        <span>👍 </span>
        {count}
      </button> */}
    </div>
  )
}
