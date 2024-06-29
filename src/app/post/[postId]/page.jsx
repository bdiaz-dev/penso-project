'use client'

import Post from '@/components/posts/Post'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PostPage ({ params }) {
  const [post, setPost] = useState(null)
  const postId = Number(params.postId) || undefined
  const router = useRouter()

  const searchByTag = (tag) => {
    router.push(`/wall/searchByTag/${tag}`)
  }

  const getPost = useCallback(async () => {
    const res = await fetch(`/api/posts/getOne/${postId}`)
    const searchedPost = await res.json()
    console.log(searchedPost)
    setPost(searchedPost.post)
  }, [postId])

  useEffect(() => {
    getPost()
  }, [getPost])

  return (
    <div
    className='mt-10'>
      {
        post &&
        <Post
        handleClickTag={searchByTag}
        isUserPost={false}
        post={post}
      />}
    </div>
  )
}
