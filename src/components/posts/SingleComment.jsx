/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'
import Image from 'next/image'
import LikeButton from '../buttons/LikeButton'
import { deleteComment, editComment } from '@/libs/handleComments'

export default function Comment ({ userId, comment }) {
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
          <div
            className='flex gap-2 items-center m-2'>
            <Image
              className='rounded-full'
              src={comment?.user?.avatar}
              alt='🙂'
              height={40}
              width={40} />

            <span>
              {comment?.user?.nickName}
            </span>
          </div>

          <div>
            {date.toLocaleDateString()}
          </div>

          {isEditing &&
            <textarea
              className='text-black p-2'
              value={editText}
              onChange={(e) => { setEditText(e.target.value) }}
              id='commentEditTextArea' />
          }
          {!isEditing &&
            <p
              className='m-2 bg-slate-700 p-2 rounded whitespace-pre-line'>
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
            className='ml-10 flex flex-row items-center gap-2'>
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
                  onClick={handleEdit}
                  className='rounded p-2 border-2 border-blue-200'>
                  {isEditing ? 'Save' : 'Edit'}
                </button>
                <button
                  onClick={handleDelete}
                  className='rounded p-2 border-2 border-blue-200'>
                  {'Delete'}
                </button>
              </>
            }
          </div>
        </div>}
    </div>
  )
}
