/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import HashtagsForm from './components/HashtagsForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function WritePage ({ post }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [tags, setTags] = useState([])
  const [text, setText] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [postingText, setPostingText] = useState(<p>Creating post...</p>)
  const [res, setRes] = useState(null)
  const handleSetTags = (tagsList) => {
    setTags(tagsList)
  }

  useEffect(() => {
    if (post) {
      setText(post.content)
      setTags([...post.hashtags])
    }
  }, [])

  useEffect(() => {
    if (!res) { setPostingText(<p className='font-bold text-2xl p-4'>Creating post...</p>) }
    if (res?.error) {
      setPostingText(
        <div className='flex flex-col justify-center items-center'>
          <div className='bg-slate-900/75 p-5 rounded-3xl flex flex-col justify-center items-center mx-4'>
            <p className='text-red-700 leading-10 font-bold text-2xl p-6'>
              {res.error}
            </p>
            <button onClick={() => { router.push('/wall') }} className='bg-blue-500 hover:bg-blue-800 rounded p-2 m-auto'>
              Return to wall
            </button>
          </div>
        </div >
      )
    }
    if (res?.message) {
      setPostingText(
        <div className='flex flex-col justify-center items-center'>
          <div className='bg-slate-900/75 p-5 rounded-3xl flex flex-col justify-center items-center mx-4'>
            {
              res.message.map((mes, index) => {
                if (index === 0) {
                  return (
                    <p key={index} className='text-blue-500 leading-10 font-bold text-7xl p-6 drop-shadow-xl'>
                      {mes}
                    </p>
                  )
                } else {
                  return (
                    <p key={index} className='text-blue-500 leading-10 font-bold text-4xl p-6'>
                      {mes}
                    </p>
                  )
                }
              }

              )
            }
            <button onClick={() => { router.push('/wall') }} className='bg-blue-500 hover:bg-blue-800 rounded p-2 m-auto mt-5'>
              Return to wall
            </button>
          </div>
        </div>
      )
      session.hasPosted = true
      console.log(session)
    }
  }, [res])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (text === '') return

    setIsPosting(true)

    const userId = session.user.id
    const userEmail = session.user.email

    console.log('user is: ', session.user)

    if (!session) {
      console.error('User not logged in')
      return
    }

    if (post) {
      const postId = post.id
      const tagsForDelete = []

      fetch('/api/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId, text, tags, userEmail, tagsForDelete })
      })
        .then(response => response.json())
        .then((data) => {
          console.log(data)
          setRes(data)
        })
    } else {
      fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text, tags, userEmail })
      })
        .then(response => response.json())
        .then((data) => {
          console.log(data)
          setRes(data)
        })
    }
  }

  return (
    <article className='relative h-screen'>

      <form className='p-5'>

        <h2 className='text-2xl text-white mb-5'>
          My diary Post
        </h2>

        <textarea onChange={(e) => setText(e.target.value)} value={text} rows='15' name="" id="" className='w-2/3 text-black'></textarea>

        <HashtagsForm handleSetTags={handleSetTags} />

        <button
          className='bg-blue-500 hover:bg-blue-800 rounded p-2'
          onClick={(e) => handleSubmit(e)}
        >
          Publish
        </button>
      </form>

      {
        isPosting &&
        <div
          className='fixed inset-0 w-screen h-full flex justify-center items-center bg-slate-900/50 backdrop-blur-sm'
        >
          <div>
            {
              postingText
            }
          </div>
        </div>
      }

    </article>
  )
}
