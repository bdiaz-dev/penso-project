'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Post from '@/components/posts/Post'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { getPins } from '@/libs/handlePins'

export default function ProfilePins ({ userId }) {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef()
  const router = useRouter()
  const { data: session } = useSession()
  const isUserPost = userId === session?.user.id

  const searchByTag = (tag) => {
    router.push(`/wall/searchByTag/${tag}`)
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const data = await getPins({ page, userId })
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
  }, [page, userId])

  useEffect(() => {
    if (hasMore && !loading) {
      loadPosts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const lastPostRef = useCallback(
    (node) => {
      if (loading || !hasMore) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          const newPage = (page + 1)
          setPage(newPage)
        }
      })

      if (node) observer.current.observe(node)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, hasMore]
  )

  return (
    <div className='m-auto mt-14 max-w-7xl'>
      {posts && posts.map((post, index) => {
        return (

          <div
            ref={index === posts.length - 1 ? lastPostRef : null}
            key={post.id}
          >

            <Post
              post={post}
              handleClickTag={searchByTag}
              isProfilePost
              isUserPost={isUserPost}
            />

          </div>

        )
      })}
      {loading && <p>Loading...</p>}
      {!hasMore && <p>No more posts to load.</p>}
    </div>
  )
}
