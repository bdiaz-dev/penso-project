/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherJsInstance } from '@/libs/pusher'

export default function LikeButton ({ table, id, isLikedBool = null, likesCount = null }) {
  const session = useSession()
  const userEmail = session?.data?.user?.email

  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(likesCount)
  const [isLiked, setIsLiked] = useState(isLikedBool)

  const getLikes = useCallback(async (table, id) => {
    console.log(table, id)
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

  useEffect(() => {
    if (likesCount !== null) return
    getLikes(table, id)
  }, [])

  useEffect(() => {
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
    setIsLiked(method === 'POST')
    setCount((prevCount) => ((method === 'POST') ? prevCount + 1 : prevCount - 1))

    try {
      setLoading(true)
      const res = await fetch(`/api/likes/${table}/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      })

      getLikes(table, id)

      const data = await res.json()
      console.log(data)
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  const handleClickLike = () => {
    handleLike(table, id, (isLiked ? 'DELETE' : 'POST'))
  }

  const normalButton = <button
    className={isLiked ? 'bg-green-600 p-2 rounded border-2 border-blue-200' : 'bg-blue-600 p-2 rounded border-2 border-blue-200'}
    onClick={!loading ? handleClickLike : console.log('not working because is loading')}
  >
    <span>👍 </span>
    {count}
  </button>

  // const loadingButton = <button
  //   className={'bg-slate-600 p-2 rounded text-slate-400 border-2 border-blue-200'}
  // >
  //   <span>👍 </span>
  //   Loading
  // </button>

  return (
    <div>
      {normalButton}
      {/* {
        !loading
          ? normalButton
          : loadingButton
      } */}
    </div>
  )
}
