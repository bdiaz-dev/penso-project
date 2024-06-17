'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function RedirectToWall ({ isNewUser }) {
  const router = useRouter()

  useEffect(() => {
    if (!isNewUser) {
      setTimeout(() => {
        router.push('/wall')
      }, 1500)
    }
  }, [isNewUser, router])
  return (
    <div>
    </div>
  )
}