// import { useParams } from 'next/navigation'

import LikeButton from '@/components/buttons/LikeButton'
import { prisma } from '@/libs/prisma'
import Image from 'next/image'

export default async function UserPage ({ params }) {
  const { id } = params

  const user = await prisma.users.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      posts: true
    }
  })

  return (
    <article>
      <div
        className='flex justify-center items-center flex-col my-4 gap-2'
      >

        <Image
          alt={'user\'s avatar'}
          width={150}
          height={150}
          src={user.avatar}
          className='justify-center items-center'
        />
        <h1
          className='font-bold text-3xl mx-2'
        >
          {`${user.nickName}'s page`}
        </h1>
      </div>

      {
        user.bio &&
        <div>
          <h2>
            Bio
          </h2>
          <div>
            {user.bio}
          </div>
        </div>
      }

      <div>

        <h2
          className='font-bold text-2xl mb-3 mx-2'
        >
          Posts
        </h2>
        <ul>
          {user.posts.map((post) => (
            <li
              key={post.id}

            >
              <b
                className='mx-2'
              >
                {post.createdAt.toLocaleDateString()}
              </b>
              <div
                className='bg-slate-600 rounded p-2 m-2'
              >
                {post.content}
              </div>
              <LikeButton
                table={'likestoposts'}
                id={post.id}
              />
            </li>
          ))}
        </ul>
      </div>

      <h3>
        {params.id}
      </h3>
    </article>
  )
}
