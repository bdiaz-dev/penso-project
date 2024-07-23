import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotifications, deleteNotification } from '@/libs/handleNotifications'
import Image from 'next/image'
import { getPusherJsInstance } from '@/libs/pusher'

export default function NotificationBell ({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [noReadedNotifications, setNoReadedNotifications] = useState(0)
  const [showingNotifications, setShowingNotifications] = useState(false)

  const text = {
    LIKE_POST: 'likes your post',
    LIKE_COMMENT: 'likes your comment',
    FOLLOW: 'has followed you',
    NEW_POST: 'has new post today!',
    NEW_COMMENT: 'has commented your post'
  }
  const eventUrl = ({ n }) => {
    const urls = {
      LIKE_POST: `/post/${n.postId}`,
      LIKE_COMMENT: `/post/${n.postId}`,
      FOLLOW: `/user/${n.actor.nickName}`,
      NEW_POST: `/post/${n.postId}`,
      NEW_COMMENT: `/post/${n.postId}`
    }
    return urls[n.type]
  }

  const notifys = useCallback(async () => {
    if (!userId) return
    const n = await getNotifications({ userId })
    const l = await n.length
    setNotifications(n)
    setNoReadedNotifications(l)
  }, [userId])

  useEffect(() => {
    notifys()
  }, [userId, notifys])

  const handleReaded = async ({ userId, notificationId }) => {
    const deleted = await deleteNotification({ userId, notificationId })
    console.log(deleted.message)
    notifys()
  }

  useEffect(() => {
    const pusher = getPusherJsInstance()

    const channel = pusher.subscribe('notifications-channel')

    const updateNotifications = (data) => {
      // console.log('>>>>>>>>>>>>>>>>> ', data)
      if (data.userId === Number(userId)) {
        notifys()
      }
    }

    channel.bind('new-notification', (data) => updateNotifications(data))

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  }, [userId, notifys])

  return (
    <div className=''>
      <b className='cursor-pointer' onClick={() => { setShowingNotifications(!showingNotifications) }}>🔔</b>
      <b className={`text-sm absolute text-white rounded-full {${noReadedNotifications > 0 ? 'border' : ' '}} px-1.5 bg-red-600`}>{`${noReadedNotifications > 0 ? noReadedNotifications : ' '}`}</b>
      {
        notifications && showingNotifications &&
        <ul
          className='absolute flex flex-col gap-2 text-sm bg-blue-400 rounded p-2'
          onMouseLeave={() => {
            setShowingNotifications(false)
          }}
        >
          {
            notifications.length > 0
              ? notifications.map((n) => {
                return (
                  <li
                    className='bg-blue-800 flex flex-row gap-2 whitespace-nowrap justify-between items-center p-2 w-full flex-grow relative'
                    key={n.id}>
                    <div className='flex-shrink-0'>
                      <Image
                        className='rounded-full'
                        src={n.actor.avatar}
                        alt='🙂'
                        width={30}
                        height={30}
                      />
                    </div>

                    <Link
                      className='flex flex-grow justify-between items-center gap-2 flex-shrink-0'
                      onClick={() => {
                        handleReaded({ userId, notificationId: n.id })
                        setShowingNotifications(false)
                      }} href={eventUrl({ n })}>
                      {n.actor.nickName}
                      <span>{text[n.type]}</span>
                    </Link>

                    <div className='flex-shrink-0 cursor-pointer' onClick={() => { handleReaded({ userId, notificationId: n.id }) }}>{'❌'}</div>
                    {/* <div>
                      .......
                    </div> */}
                  </li>
                )
              })
              : 'nothing new here... 🌞'
          }
        </ul>}
    </div>
  )
}
