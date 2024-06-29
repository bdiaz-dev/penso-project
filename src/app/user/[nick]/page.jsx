import { prisma } from '@/libs/prisma'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import Post from '@/components/posts/Post'
import Bio from './components/Bio'
import FollowButton from '@/components/FollowButton'
import searchId from '@/libs/searchId'

export default async function UserPage ({ params }) {
  const session = await getServerSession()
  const { nick } = params

  const user = await prisma.users.findFirst({
    where: {
      nickName: {
        equals: nick,
        mode: 'insensitive'
      }
    }
  })

  if (user) {
    const posts = await prisma.posts.findMany({
      where: {
        userId: user.id
      },
      include: {
        hashtags: {
          include: {
            hashtag: true
          }
        },
        _count: { select: { likes: true } },
        likes: { where: { user } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    user.posts = posts
  }

  const isUserPage = user.email === session.user.email
  const userId = await searchId(session.user.email)

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
        user.email !== session.user.email &&
        <div className='flex justify-center items-center'>
          <FollowButton userId={userId} toFollowId={user.id} />
        </div>}

      <Bio
        user={user}
        canEdit={isUserPage}
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
                isUserPost={isUserPage}
              />
            </li>
          ))}
        </ul>
      </div>

      <h3>
        {nick}
      </h3>
    </article>
  )
}
