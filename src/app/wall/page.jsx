'use client'

import { useState } from 'react'
import FollowingPosts from './components/followingPosts'
import ExplorePosts from './components/explorePosts'

export default function PostsFeed () {
  const [isOnExplore, setIsOnExplore] = useState(false)

  return (
    <div className='m-auto mt-14 max-w-7xl'>

{/* Feed Mode Buttons */}
      <div className='flex flex-row gap-4 justify-center items-center p-2'>
        <button
          onClick={() => setIsOnExplore(false)}
          className={`bg-blue-${isOnExplore ? '400' : '600'} hover:bg-blue-600 p-2 rounded`}>
          Following
        </button>
        <button
          onClick={() => setIsOnExplore(true)}
          className={`bg-blue-${isOnExplore ? '600' : '400'} hover:bg-blue-600 p-2 rounded`}>
          Explore
        </button>
      </div>

{/* Feeds Components */}
      <div className={`${isOnExplore ? 'hidden' : 'block'}`}>
        <FollowingPosts />
      </div>
      <div className={`${!isOnExplore ? 'hidden' : 'block'}`}>
        <ExplorePosts />
      </div>

    </div>
  )
}
