'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
// import Image from 'next/image'
import Post from '@/components/posts/Post'

export default function PostsFeed () {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/posts?page=${page}&limit=5`)
    const data = await res.json()
    if (!data.posts) {
      setHasMore(false)
    } else {
      if (data?.posts?.length === 0) {
        setHasMore(false)
      } else {
        // setPosts([...data?.posts])
        setPosts((prevPosts) => {
          const postIds = new Set(prevPosts.map(post => post.id))
          const newPosts = data.posts.filter(post => !postIds.has(post.id))
          return [...prevPosts, ...newPosts]
        })
        setHasMore(data.hasMore)
      }
    }
    setLoading(false)
  }, [page])

  // useEffect(() => {
  //   console.log('>>>>>>> page:', page)
  //     , [page]
  // })

  useEffect(() => {
    if (hasMore && !loading) {
      loadPosts()
    }
  }, [page])

  const lastPostRef = useCallback(
    (node) => {
      // console.log(observer)
      if (loading || !hasMore) return
      //   console.log('no pasa')
      //   return
      // }
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const newPage = (page + 1)
          setPage(newPage)
          // console.log('>>>>>>>>>>>>  pagina:', page)
        }
      })
      // console.log(observer)

      if (node) observer.current.observe(node)
      // console.log(observer)
    },
    [loading, hasMore]
  )

  return (
    <div className='mt-14'>
      {posts && posts.map((post, index) => {
        // const date = new Date(post.createdAt)
        // console.log(post.id)
        // const isLastElement = index === posts.length - 1
        return (

        // <Suspense
        // >

          <div
            ref={index === posts.length - 1 ? lastPostRef : null}
            key={post.id}
          >

            <Post
              post={post}
            />

          </div>

        // </Suspense>
        // <div className='mx-20 mb-20' key={post.id} ref={index === posts.length - 1 ? lastPostRef : null}>

        //   <div className='flex flex-row justify-start items-center'>
        //     <Image src={post.user.avatar} alt="user avatar" height={50} width={50} />
        //     <h2>{post.user.userName}</h2>
        //   </div>

        //   <div>
        //     {date.toLocaleDateString()}
        //   </div>

        //   <div className='bg-slate-400 rounded p-2'>
        //     <p className='ml-5 mb-5'>{post.content}</p>
        //   </div>

        //   <div className='ml-5 flex flex-row gap-2'>
        //     {post.hashtags.map((h) => (
        //       <div key={h.id} className='bg-slate-600 text-white rounded p-1'>
        //         <b>
        //           {h.hashtag.tag}
        //         </b>
        //       </div>
        //     ))}
        //   </div>

        //   <div>
        //     <span>👍 </span>
        //     {post.likes.length}
        //   </div>

        //   <button className={`${post.isFollowing ? 'bg-green-400' : 'bg-blue-400'} p-2`}>
        //     {
        //       post.isFollowing ? 'Following' : 'Follow'
        //     }
        //   </button>

        // </div>
        )
      })}
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more posts to load.</p>}
    </div>
  )
}
