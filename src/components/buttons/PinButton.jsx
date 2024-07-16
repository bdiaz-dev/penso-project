/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
// import { getPusherJsInstance } from '@/libs/pusher'
import { deletePin, newPin, postPins } from '@/libs/handlePins'

export default function PinsButton ({ postId, initialCount, isPinedByUser }) {
  const session = useSession()
  const userId = session?.data?.user?.id

  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [isPined, setIsPined] = useState(isPinedByUser)

  const getPostPins = useCallback(async ({ userId, postId }) => {
    if (!userId || !postId) return
    if (loading) return

    try {
      setLoading(true)

      const res = await postPins({ userId, postId })
      const data = await res.json()

      // console.log(data)

      setCount(await data.countPins)
      setIsPined(await data.isPined)
    } catch (error) {
      console.log(error.message)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    if (initialCount !== null) return
    getPostPins({ postId, userId })
  }, [])

  // useEffect(() => {
  //   const pusher = getPusherJsInstance()

  //   const channel = pusher.subscribe(`${table}-likes-channel`)

  //   const updateCount = (data) => {
  //     if (data.postId === id) {
  //       setCount(data.likesCount)
  //     }
  //   }

  //   channel.bind('new-like', (data) => updateCount(data))
  //   channel.bind('remove-like', (data) => updateCount(data))

  //   return () => {
  //     channel.unbind_all()
  //     channel.unsubscribe()
  //   }
  // }, [id])

  // console.log(likes)

  const handlePin = useCallback(async ({ postId, userId, method }) => {
    if (!postId || !userId) return
    if (loading) return
    setIsPined(method === 'POST')
    setCount((prevCount) => ((method === 'POST') ? prevCount + 1 : prevCount - 1))

    try {
      setLoading(true)

      method === 'POST' ? await newPin({ userId, postId }) : await deletePin({ userId, postId })

      postPins({ userId, postId })
      setLoading(false)
    } catch (error) {
      console.log(error.message)
    }
  }, [])

  const handleClickPin = () => {
    handlePin({ userId, postId, method: (isPined ? 'DELETE' : 'POST') })
  }

  const normalButton = <button
    className={isPined ? 'bg-green-600 p-1 px-2 rounded border-2 border-blue-200' : 'bg-blue-600 p-1 px-2 rounded border-2 border-blue-200'}
    onClick={!loading ? handleClickPin : console.log('not working because is loading')}
  >
    <span>📌 </span>
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
