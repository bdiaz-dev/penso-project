'use client'
import Image from 'next/image'
import LikeButton from '../buttons/LikeButton'
import { Suspense } from 'react'
import { useRouter } from 'next/navigation'

export default function Post ({ post }) {

  const date = new Date(post.createdAt)
  const router = useRouter()

  return (


    < div className='mx-20 mb-20' >

      <div className='flex flex-row justify-start items-center'>
        <Image
          onClick={() => { router.push(`/user/${post.user.id}`) }}
          src={post?.user?.avatar}
          alt="user avatar"
          height={50}
          width={50}
          className='cursor-pointer'
        />
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
      </div>

      <div className='ml-5 flex flex-row gap-2'>
        {(post.hastags) && post.hashtags.map((h) => (
          <div key={h.id} className='bg-slate-600 text-white rounded p-1'>
            <b>
              {h.hashtag.tag}
            </b>
          </div>
        ))}
      </div>

      <Suspense>

        <LikeButton
          // likes={post?.likes?.length ?? 0}
          table={'likestoposts'}
          id={post.id}
        />

      </Suspense>


      {/* <div>
        <span>👍 </span>
        {post?.likes?.length ?? 0}
      </div> */}

      {/* <button className={`${post.isFollowing ? 'bg-green-400' : 'bg-blue-400'} p-2`}>
      {
        post.isFollowing ? 'Following' : 'Follow'
      }
    </button> */}

    </div >
  )
}