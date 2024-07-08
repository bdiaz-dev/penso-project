'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
import { getComments, newComment } from '@/libs/handleComments'
// import Image from 'next/image'
// import LikeButton from '../buttons/LikeButton'
import { useSession } from 'next-auth/react'
import Comment from './SingleComment'

export default function Comments ({ postId, initialComments, commentsCount }) {
  const { data: session } = useSession()
  // const { user } = session
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isWriting, setIsWriting] = useState(false)
  const [newCommentFormText, setNewCommentFormText] = useState('')
  const [user, setUser] = useState()
  const [count, setCount] = useState(commentsCount)
  // const router = useRouter()

  const loadComments = useCallback(async () => {
    setLoading(true)
    const data = (page > 1)
      ? await getComments({ page, postId })
      : { comments: initialComments, hasMore: (commentsCount > 2) }
    if (!data.comments) {
      console.log('!')
      setHasMore(false)
    } else {
      if (data?.comments?.length === 0) {
        console.log('x')
        setHasMore(false)
      } else {
        setComments((prevComments) => {
          const commentsId = new Set(prevComments.map(comm => comm.id))
          const newComments = data.comments.filter(comm => !commentsId.has(comm.id))
          return [...prevComments, ...newComments]
        })
        setHasMore(data.hasMore)
      }
    }
    setLoading(false)
  }, [page, postId, initialComments, commentsCount])

  useEffect(() => {
    if (comments.length === commentsCount) {
      console.log('final')
      setHasMore(false)
    }
  }, [comments, commentsCount])

  useEffect(() => {
    if (hasMore && !loading) {
      loadComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  useEffect(() => {
    if (session) {
      setUser(session.user)
    }
  }, [session])

  const handleNewComment = useCallback(async (e) => {
    e.preventDefault()
    try {
      const commentData = await newComment({ text: newCommentFormText, postId, userId: user.id })
      const date = Date.now()
      const newCommentForPrint = {
        content: newCommentFormText,
        id: Number(commentData.commentId),
        postId,
        user: {
          avatar: user.image,
          id: Number(user.id),
          nickName: commentData.userNick
        },
        createdAt: date,
        likes: [],
        _count: { likes: 0 }

      }
      setIsWriting(false)
      setComments((prevComments) => {
        return [newCommentForPrint, ...prevComments]
      })
      if (commentData) { setCount((prevCount) => (prevCount + 1)) }
    } catch (error) {
      console.log(error.message)
    }
  }, [newCommentFormText, postId, user, setIsWriting])

  return (
    <div>
      <div>
        <h2
        className='text-xl mb-2'>
          {`Comments (${count})`}
        </h2>
      </div>
      <div>
        <button
          className='p-1 rounded bg-blue-400 hover:bg-blue-600'
          onClick={() => { setIsWriting((prevSt) => !prevSt) }}>
          {
            isWriting
              ? 'Cancel'
              : 'Write New Comment'
          }
        </button>
      </div>
      {
        isWriting &&
        <form>
          <textarea
            className='text-black p-2'
            onChange={(e) => { setNewCommentFormText(e.target.value) }}
            value={newCommentFormText}
            rows={3} id='commentTextArea' />
          <button
            onClick={(e) => { handleNewComment(e) }}
            className='p-1 rounded bg-green-800 hover:bg-green-600'>
            Save
          </button>
        </form>}

      <div>
        <ul
          className='w-4/5'>
          {
            comments &&
            comments.map((c) => (
              <li
                key={c.id}
                className='mb-10'>

                <Comment
                  comment={c}
                  userId={user?.id} />
              </li>
            ))
          }
        </ul>
      </div>

      {
        loading &&
        <div>
          <p>
            Loading...
          </p>
        </div>
      }

      {hasMore && <div>
        <button
          className='bg-blue-400 hover:bg-blue-600 p-1 rounded'
          onClick={() => { setPage((prevPage) => prevPage + 1) }}>
          {'Get More ->'}
        </button>
      </div>}
    </div>
  )
}
