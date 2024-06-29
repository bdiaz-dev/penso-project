'use client'

import { askFollow, deleteFollow, newFollow } from '@/libs/handleFollow'
import { useCallback, useEffect, useState } from 'react'

export default function FollowButton ({ userId, toFollowId }) {
  const [isFollowed, setIsFollowed] = useState(false)

  const settingFollow = useCallback(async () => {
    if (!userId) return
    const f = await askFollow({ userId, followingId: toFollowId })
    console.log(f)
    setIsFollowed(f)
  }, [userId, toFollowId])

  const follow = useCallback(async ({ userId, followedId }) => {
    if (!userId) return
    setIsFollowed(true)
    await newFollow({ userId, followedId })
    await settingFollow()
  }, [settingFollow])

  const cancelFollow = useCallback(async ({ userId, followedId }) => {
    if (!userId) return
    setIsFollowed(false)
    await deleteFollow({ userId, followedId })
    await settingFollow()
  }, [settingFollow])

  const handleFollow = ({ userId, followedId }) => {
    isFollowed
      ? cancelFollow({ userId, followedId })
      : follow({ userId, followedId })
  }

  useEffect(() => {
    settingFollow()
  }, [settingFollow])

  return (
    <div>
      <button
        onClick={() => { handleFollow({ userId, followedId: toFollowId }) }}
        className={` p-2 rounded ${isFollowed ? 'bg-green-600 hover:bg-red-800' : 'bg-blue-600 hover:bg-blue-800'}`}>
        {
          isFollowed
            ? 'Following'
            : 'Follow'
        }
      </button>
    </div>
  )
}
