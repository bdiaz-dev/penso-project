import { prisma } from '@/libs/prisma'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import Bio from './components/Bio'
import FollowButton from '@/components/FollowButton'
import searchId from '@/libs/searchId'
import ProfilePosts from './components/ProfilePosts'

export default async function UserPage ({ params }) {
  const session = await getServerSession()
  const { nick } = params

  const profile = await prisma.users.findFirst({
    where: {
      nickName: {
        equals: nick,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      avatar: true,
      nickName: true,
      bio: true,
      email: true
    }
  })

  // if (user) {
  //   const posts = await prisma.posts.findMany({
  //     where: {
  //       userId: user.id
  //     },
  //     include: {
  //       hashtags: {
  //         include: {
  //           hashtag: true
  //         }
  //       },
  //       comments: {
  //         include: { user: true },
  //         take: 2,
  //         orderBy: {
  //           createdAt: 'desc'
  //         }
  //       },
  //       _count: { select: { likes: true, comments: true } },
  //       likes: { where: { user } }
  //     },
  //     orderBy: {
  //       createdAt: 'desc'
  //     }
  //   })

  //   user.posts = posts
  // }

  const isUserPage = profile.email === session.user.email
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
          src={profile.avatar}
          className='justify-center items-center'
        />
        <h1
          className='font-bold text-3xl mx-2'
        >
          {`${profile.nickName}'s page`}
        </h1>
      </div>

      {
        profile.email !== session.user.email &&
        <div className='flex justify-center items-center'>
          <FollowButton userId={userId} toFollowId={profile.id} />
        </div>}

      <Bio
        user={profile}
        canEdit={isUserPage}
      />

      <div>

        <h2
          className='font-bold text-2xl mb-3 mx-2'
        >
          Posts
        </h2>
        <ProfilePosts userId={profile.id} />
      </div>

      <h3>
        {nick}
      </h3>
    </article>
  )
}
