// import { useParams } from 'next/navigation'

import { prisma } from '@/libs/prisma'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import searchId from '@/libs/searchId'
import Post from '@/components/posts/Post'
import Bio from './components/Bio'

export default async function UserPage ({ params }) {
  const session = await getServerSession()
  const sessionId = await searchId(session?.user?.email)
  const { id } = params

  console.log('##### sesionid', sessionId)

  const user = await prisma.users.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      posts: {
        include: {
          hashtags: {
            include: {
              hashtag: true
            }
          },
          _count: { select: { likes: true } },
          likes: { where: { id: Number(id) } }
        }
      }
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
      <Bio
        user={user}
        canEdit={(Number(id) === Number(sessionId))}
      />

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
              className=' rounded p-2 mx-2 mb-4 flex flex-col justify-center'
            >
              <Post
                post={post}
                noAvatar
                isUserPost={(Number(id) === Number(sessionId))}
              />
              {/* <div>
                {
                  (Number(id) === Number(sessionId))
                    ? <div
                    className='mx-2 flex gap-5'>
                      <b>Edit</b>
                      <b>Delete</b>
                    </div>
                    : <></>
                }
              </div> */}
            </li>
          ))}
        </ul>
      </div>

      <h3>
        {id}
      </h3>
    </article>
  )
}
