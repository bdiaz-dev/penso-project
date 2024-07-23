/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LikeButton from '../buttons/LikeButton'
import { deleteComment, editComment } from '@/libs/handleComments'
import { useRouter } from 'next/navigation'

export default function Comment ({ userId, comment }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editText, setEditText] = useState(comment.content)
  const [commentContent, setCommentContent] = useState(comment.content)
  const isUserComment = Number(userId) === Number(comment?.user?.id)
  const [isUpdated, setIsUpdated] = useState(false)
  const [updatedDate, setUpdatedDate] = useState(new Date(comment.updatedAt))
  const [isDeleted, setIsDeleted] = useState(false)
  const date = new Date(comment.createdAt)
  // const updatedDate = new Date(comment.updatedAt)
  // const router = useRouter()
  // console.log(comment)

  const handleDelete = useCallback(async () => {
    const userConfirm = confirm('Are you sure to delete this comment?')
    if (!userConfirm) return
    try {
      const response = await deleteComment({ userId, commentId: comment.id })
      if (response.ok) {
        setIsDeleted(true)
        alert('Your comment has been deleted')
      } else {
        throw new Error(response)
      }
    } catch (error) {
      alert('Internal error, this comment maybe is not deleted')
    }
  })

  const handleEdit = (e) => {
    e.preventDefault()
    isEditing
      ? saveCommentChanges()
      : setIsEditing(true)
  }
  const handleCancelEdit = (e) => {
    e.preventDefault()
    setEditText(comment.content)
    setIsEditing(false)
  }

  const saveCommentChanges = useCallback(async () => {
    setIsSaving(true)
    const editedComment = await editComment({ userId, commentId: comment.id, text: editText })
    console.log(editedComment)
    if (editedComment.ok) {
      setCommentContent(editText)
      setUpdatedDate(new Date(editedComment.updatedAt))
      setIsUpdated(true)
    }
    setIsSaving(false)
    setIsEditing(false)
  }, [comment.id, editText, userId])

  useEffect(() => {
    if (date.getHours() < updatedDate.getHours()) {
      setIsUpdated(true)
    }
  }, [date, updatedDate])

  return (
    <div>
      {
        isSaving &&
        <b>Saving changes...</b>
      }

      {
        isDeleted ||
        <div>
          <div className='flex flex-row justify-start items-center gap-3 relative mb-2'>
            <Image
              onClick={() => { router.push(`/user/${comment.user.nickName}`) }}
              src={comment?.user?.avatar}
              alt="user avatar"
              height={50}
              width={50}
              className='cursor-pointer rounded-full'
            />
            <div>
              <h2
                onClick={() => { router.push(`/user/${comment.user.nickName}`) }}
                className='cursor-pointer font-bold'

              >
                {comment?.user?.nickName}
              </h2>
              <div className='italic text-slate-400'>
                {date.toLocaleDateString()}
              </div>
            </div>
          </div>

          {isEditing &&
            <textarea
              className='text-black p-2 w-5/6 rounded'
              value={editText}
              onChange={(e) => { setEditText(e.target.value) }}
              id='commentEditTextArea' />
          }
          {!isEditing &&
            <p
              className='py-2 mb-2 rounded whitespace-pre-line'>
              {`${commentContent}`}
              <br />

              {
                isUpdated &&
                <span className='text-slate-400'>
                  {/* <hr className='mt-4'/> */}
                  {`< Edited on ${updatedDate.toLocaleDateString()} >`}
                </span>
              }
            </p>}
          <div
            className='flex flex-row items-center gap-2'>
            <LikeButton
              // likes={post?.likes?.length ?? 0}
              table={'likestocomments'}
              id={comment.id}
              isLikedBool={comment.likes > 0}
              likesCount={comment?._count?.likes}
            />
            {isUserComment &&
              <>
                <button
                  title='Edit comment'
                  onClick={handleEdit}
                  className='rounded p-1 px-2 border-2 border-blue-200'>
                  {isEditing ? '💾 Save' : '✍'}
                </button>
                {
                  isEditing &&
                  <button
                  onClick={handleCancelEdit}
                  className='rounded p-1 px-2 border-2 border-blue-200'>
                    ⏪ Cancel
                  </button>
                }
                <button
                  title='Delete comment'
                  onClick={handleDelete}
                  className='rounded p-1 px-2 border-2 border-blue-200'>
                  {'❌'}
                </button>
              </>
            }
          </div>
        </div>}
    </div>
  )
}
