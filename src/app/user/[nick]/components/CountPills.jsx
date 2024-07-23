'use client'

import { useState } from 'react'

export default function CountPills ({ follows, streak }) {
  const [isShowingFollowingMessage, setIsShowingFollowingMessage] = useState(false)
  const [isShowingStreakMessage, setIsShowingStreakMessage] = useState(false)
  const countPillsStyle = 'bg-slate-600 p-2 px-4 rounded'
  const messageStyle = 'bg-blue-600 p-2 rounded text-sm'
  return (
    <div className='flex flex-row justify-center gap-4 mb-4'>
      {follows && <b className={countPillsStyle}
      onMouseOver={setIsShowingFollowingMessage(true)}
      onMouseLeave={setIsShowingFollowingMessage(false)}>{`👁‍🗨 ${follows}`}</b>}
      {
        isShowingFollowingMessage &&
        <div className={messageStyle}>Followers</div>
      }
      {streak && <b className={countPillsStyle}
      onMouseOver={setIsShowingStreakMessage(true)}
      onMouseLeave={setIsShowingStreakMessage(false)}>{` 🔥 ${streak}`}</b>}
      {
        isShowingStreakMessage &&
        <div className={messageStyle}>Days non-stop posting</div>
      }
    </div>
  )
}
