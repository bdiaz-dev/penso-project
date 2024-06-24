'use client'
import Image from 'next/image'
import LikeButton from '../buttons/LikeButton'
import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HashtagsForm from '@/app/write/components/HashtagsForm'
import { useSession } from 'next-auth/react'

export default function Post ({ post, noAvatar, isUserPost, handleClickTag }) {
  const [isEditing, setIsEditing] = useState(false)
  const [textEdit, setTextEdit] = useState(post.content)
  const [hashtagsList, setHashtagsList] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const { data: session } = useSession()
  const date = new Date(post.createdAt)
  const updatedDate = new Date(post.updatedAt)
  const router = useRouter()
  const handleSetTags = (tagsList) => {
    setHashtagsList(tagsList)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (textEdit === '') return

    setIsSaving(true)

    const userId = session.user.id
    const userEmail = session.user.email

    // console.log('user is: ', session.user)

    if (!session) {
      console.error('User not logged in')
      return
    }

    const postId = post.id
    // const tagsForDelete = []

    fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userId, text: textEdit, tags: hashtagsList, userEmail })
    })
      .then(response => response.json())
      .then((data) => {
        // console.log(data)
        // setRes(data)
        post.content = textEdit
        // console.log('>>> .. hashtagslist', hashtagsList)
        post.hashtags = hashtagsList

        if (data.ok) { setIsUpdated(true) }

        setIsSaving(false)
        setIsEditing(false)
      })
  }

  const handleDelete = () => {
    if (!session) {
      console.error('User not logged in')
      return
    }
    if (confirm(`Are you sure to delete the post of ${date} ?`) === true) {
      fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id, userId: session.user.id })
      })
        .then(response => response.json())
        .then((data) => {
          console.log(data)
          if (!data.ok) {
            setIsDeleted(false) // <-------------------------------------------------------------------- TODO, NO RENDERIZA ELIMINADO
          } else {
            setIsDeleted(true)
          }
          // setRes(data)
          // post.content = textEdit
          // console.log('>>> .. hashtagslist', hashtagsList)
          // post.hashtags = hashtagsList

          // setIsSaving(false)
          // setIsEditing(false)
        })
    }
  }

  useEffect(() => {
    if (!post.hashtags) return
    const newList = []
    // eslint-disable-next-line array-callback-return
    post.hashtags.map((h) => {
      newList.push(h.hashtag)
    })
    // console.log(newList)
    // console.log(post.hashtags)
    setHashtagsList(newList)
  }, [post.hashtags])

  useEffect(() => {
    if (date.getHours() < updatedDate.getHours()) {
      setIsUpdated(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   if (isDeleted) {
  //     setRender(<></>)
  //   } else {
  //     setRender(<>
  //       {
  //         isDeleted
  //           ? <></>
  //           : <>

  //             {
  //               isSaving
  //                 ? <b className='text-white'>Saving...</b>
  //                 : <>
  //                   {
  //                     isEditing

  //                       ? <form className='mx-20 mb-20'>

  //                         <b>
  //                           Editing
  //                         </b>

  //                         <textarea
  //                           className='text-black w-full h-auto resize-none p-4 rounded border-blue-700 border-4'
  //                           rows={8}
  //                           value={textEdit}
  //                           onChange={(e) => { setTextEdit(e.target.value) }} />

  //                         <HashtagsForm
  //                           initialTagsList={hashtagsList}
  //                           handleSetTags={handleSetTags} />

  //                         <button
  //                           className='bg-blue-700 hover:bg-blue-500 rounded p-2'
  //                           onClick={(e) => { handleSubmit(e) }}>
  //                           Save
  //                         </button>

  //                       </form>

  //                       : < div className='mx-20 mb-20' >

  //                         <div className='flex flex-row justify-start items-center'>
  //                           {
  //                             noAvatar ||
  //                             <Image
  //                               onClick={() => { router.push(`/user/${post.user.id}`) }}
  //                               src={post?.user?.avatar}
  //                               alt="user avatar"
  //                               height={50}
  //                               width={50}
  //                               className='cursor-pointer'
  //                             />}
  //                           <h2
  //                             onClick={() => { router.push(`/user/${post.user.id}`) }}
  //                             className='cursor-pointer'

  //                           >
  //                             {post?.user?.nickName}
  //                           </h2>
  //                         </div>

  //                         <div>
  //                           {date.toLocaleDateString()}
  //                         </div>

  //                         <div className='bg-slate-400 rounded p-2'>
  //                           <p className='ml-5 mb-5'>{post.content}</p>
  //                           {
  //                             isUpdated &&
  //                             <b>
  //                               {`< Edited ${updatedDate} >`}
  //                             </b>
  //                           }

  //                         </div>

  //                         <div className='ml-5 flex flex-row gap-2'>
  //                           {(post.hashtags) && post.hashtags.map((h, index) => (
  //                             <div key={index} className='bg-slate-600 text-white rounded p-1'>
  //                               <b>
  //                                 {
  //                                   h.hashtag
  //                                     ? h.hashtag.tag
  //                                     : h.tag
  //                                 }
  //                               </b>
  //                             </div>
  //                           ))}
  //                         </div>

  //                         <div>
  //                           {
  //                             isUserPost
  //                               ? <div
  //                                 className='mt-2 flex gap-5'>
  //                                 <b
  //                                   onClick={() => setIsEditing(true)}
  //                                   className='cursor-pointer'>
  //                                   Edit</b>
  //                                 <b
  //                                   onClick={handleDelete}>
  //                                   Delete</b>
  //                               </div>
  //                               : <></>
  //                           }
  //                         </div>

  //                         <Suspense>

  //                           <LikeButton
  //                             // likes={post?.likes?.length ?? 0}
  //                             table={'likestoposts'}
  //                             id={post.id}
  //                             isLikedBool={post.likes > 0}
  //                             likesCount={post._count.likes}
  //                           />

  //                         </Suspense>

  //                         {/* <button className={`${post.isFollowing ? 'bg-green-400' : 'bg-blue-400'} p-2`}>
  //       {
  //         post.isFollowing ? 'Following' : 'Follow'
  //       }
  //     </button> */}

  //                       </div >
  //                   }
  //                 </>
  //             }
  //           </>
  //       }
  //     </>) // RTENDER
  //   }
  // }, [isDeleted])

  return (
    // <>
    // {render}
    // </>
    <div
    className={`${isDeleted ? 'hidden' : 'block'}`}>
            {
              isSaving
                ? <b className='text-white'>Saving...</b>
                : <>
                  {
                    isEditing

                      ? <form className='mx-20 mb-20'>

                        <b>
                          Editing
                        </b>

                        <textarea
                          className='text-black w-full h-auto resize-none p-4 rounded border-blue-700 border-4'
                          rows={8}
                          value={textEdit}
                          onChange={(e) => { setTextEdit(e.target.value) }} />

                        <HashtagsForm
                          initialTagsList={hashtagsList}
                          handleSetTags={handleSetTags} />

                        <button
                          className='bg-blue-700 hover:bg-blue-500 rounded p-2'
                          onClick={(e) => { handleSubmit(e) }}>
                          Save
                        </button>

                      </form>

                      : < div className='mx-20 mb-20' >

                        <div className='flex flex-row justify-start items-center'>
                          {
                            noAvatar ||
                            <Image
                              onClick={() => { router.push(`/user/${post.user.id}`) }}
                              src={post?.user?.avatar}
                              alt="user avatar"
                              height={50}
                              width={50}
                              className='cursor-pointer'
                            />}
                          <h2
                            onClick={() => { router.push(`/user/${post.user.id}`) }}
                            className='cursor-pointer'

                          >
                            {post?.user?.nickName}
                          </h2>
                        </div>

                        <div>
                          {date.toLocaleDateString()}
                        </div>

                        <div className='bg-slate-400 rounded p-2'>
                          <p className='ml-5 mb-5'>{post.content}</p>
                          {
                            isUpdated &&
                            <b>
                              {`< Edited on ${updatedDate} >`}
                            </b>
                          }

                        </div>

                        <div className='flex flex-row gap-2 mt-2'>
                          {(post.hashtags) && post.hashtags.map((h, index) => (
                            <div onClick={() => {
                              const t = h.hashtag ? h.hashtag.tag : h.tag
                              handleClickTag(t)
                            }} key={index} className='bg-slate-600 text-white rounded p-1 cursor-pointer hover:bg-slate-800'>
                              <b>
                                {
                                  h.hashtag
                                    ? h.hashtag.tag
                                    : h.tag
                                }
                              </b>
                            </div>
                          ))}
                        </div>

                        <div>
                          {
                            isUserPost
                              ? <div
                                className='mt-2 flex gap-5'>
                                <b
                                  onClick={() => setIsEditing(true)}
                                  className='cursor-pointer'>
                                  Edit</b>
                                <b
                                  onClick={handleDelete}>
                                  Delete</b>
                              </div>
                              : <></>
                          }
                        </div>

                        <Suspense>

                          <LikeButton
                            // likes={post?.likes?.length ?? 0}
                            table={'likestoposts'}
                            id={post.id}
                            isLikedBool={post.likes > 0}
                            likesCount={post._count.likes}
                          />

                        </Suspense>

                        {/* <button className={`${post.isFollowing ? 'bg-green-400' : 'bg-blue-400'} p-2`}>
      {
        post.isFollowing ? 'Following' : 'Follow'
      }
    </button> */}

                      </div >
                  }
                </>
            }
          </div>
  )
}
