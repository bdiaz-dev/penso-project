/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import SaveNickName from '@/libs/saveNickName'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NickNameInput ({ id }) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const alertChars = ['Nickname must be at least 4 characters', 'text-yellow-700']
  const alertExists = ['This nickname already exists', 'text-red-700']
  const [alert, setAlert] = useState(alertChars)
  useEffect(() => {
    if (input.length < 4) {
      setAlert(alertChars)
      return
    }
    const getData = setTimeout(() => {

      console.log(input)
      fetch(`http://localhost:3000/api/users/checkNickName/${input}`)
        .then(response => response.json())
        .then(data => {
          if (data) {
            setAlert(alertExists)
          } else if (input.length < 4) {
            setAlert(alertChars)
          } else {
            setAlert(['', ''])
          }
        })
    }, 1000)
    return () => clearTimeout(getData)
  }, [input])
  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      SaveNickName(id, input)
      router.push('/wall')
    } catch (error) {
      console.log(error.message)
      return
    }
  }

  return (
    <form>
      <input
        className={`text-black p-2 rounded ${!alert[0] ? 'bg-green-300' : 'bg-white'}`}
        type="text"
        onChange={(e) => setInput(e.target.value)}
        value={input}
      />
      <button
        onClick={(e) => handleSubmit(e)}
        disabled={alert[0] || !input ? true : false}
        className={`bg-slate-100 rounded p-2 ml-2 ${alert[0] ? 'text-slate-700 line-through ' : 'text-green-700 font-bold'}`}
      >
        Save
      </button>
      <p className={`font-bold ${alert[1]}`}>
        {alert[0]}
      </p>
    </form>
  )
}