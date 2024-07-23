// 'use client'

import NickNameInput from '@/components/NickNameInput'
import getUserData from '@/libs/getUserData'
import searchId from '@/libs/searchId'
// import { useSession } from 'next-auth/react'
// import { useEffect } from 'react'
import { getServerSession } from 'next-auth'
import RedirectToWall from './components/RedirectToWall'

export default async function WelcomePage () {
  const session = await getServerSession()

  const userEmail = session?.user?.email
  const userIdString = await searchId(userEmail)
  const userId = Number(userIdString)

  session.user.id = userId

  console.log('on welcome ', session)
  // const isNewUser = await checkNewUser(userId)

  const userData = await getUserData(userId)

  const isNewUser = (!userData.nickName)

  console.log(session)
  return (
    session?.user
      ? (
        <div className='h-screen flex flex-col justify-center items-center align-middle'>
          <h1 className='text-xl font-bold'>
            {`Welcome ${session.user.name}`}
          </h1>
          <p>
            {`Your user ID is: ${session.user.id}`}
          </p>

          {
            isNewUser && (
              <div className='fixed w-full h-full top-0 left-0 bg-black flex flex-row justify-center items-center z-50'>
                <div>
                  <h1 className='text-xl font-bold'>
                    {`Welcome ${session.user.name}`}
                  </h1>
                  <p>You are new here! Please choose a nickname:</p>
                  <NickNameInput
                    id={userId}
                  />
                </div>
              </div>
            )
          }
          <RedirectToWall isNewUser={isNewUser} />
        </div>
        )
      : (
        <h1 className='h-screen flex justify-center items-center align-middle'>
          Loading...
        </h1>
        )
  )
}
