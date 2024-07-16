import { getServerSession } from 'next-auth'
import searchId from '@/libs/searchId'
import ProfilePins from '../user/[nick]/components/ProfilePins'

export default async function UserPage ({ params }) {
  const session = await getServerSession()
  const { nick } = params
  const userId = await searchId(session.user.email)

  return (
    <article>
      <div
        className='flex justify-center items-center flex-col my-4 gap-2'
      >

      <div>

        <h2
          className='font-bold text-2xl mb-3 mx-2'
        >
          My Pins
        </h2>
        <ProfilePins userId={userId} />
      </div>

      <h3>
        {nick}
      </h3>
      </div>
    </article>
  )
}
