import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

export default async function Home (req) {
  const session = await getServerSession()
  console.log(session)
  if (session) { redirect('/wall') }
  return (
    <div className='flex flex-row justify-center items-center h-svh'>
      <div>
        <h1 className='text-2xl'>
          Welcome to Penso Project
        </h1>
        <hr />
        <p>
          The place where you can write your diary thinkings.
        </p>
        <p>
          Signin to start discover people mind.
        </p>
      </div>
    </div>
  )
}
