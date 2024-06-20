'use client'

import { useState } from 'react'

export default function Bio ({ user, canEdit }) {
  console.log(user.bio)
  const [bio, setBio] = useState(user.bio)
  const [formValue, setFormValue] = useState(user.bio)
  const [isEditing, setIsEditing] = useState(false)
  const handleSave = (e) => {
    e.preventDefault()
    setBio(formValue)
    setIsEditing(false)
    const userId = user.id
    fetch('/api/users/updateBio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text: formValue })
    })
      .then(response => response.json())
      .then((data) => {
        console.log(data)
      })
  }
  return (
    <div>
      {
        bio
          ? <div className={
            `flex flex-col justify-center items-center ${isEditing
              ? 'hidden'
              : 'block'}`}>
            <div
              className='bg-slate-400 p-2 rounded'>
              {bio}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className='bg-blue-400 hover:bg-blue-600 rounded-full mt-2 p-2'>
              ✍
            </button>
          </div>
          : canEdit &&
          <div className='flex justify-center m-4'>
            <button
              className={`bg-blue-400 p-2 rounded hover:bg-blue-600 ${isEditing ? 'hidden' : 'block'}`}
              onClick={() => { setIsEditing(true) }}
            >
              {'Add Bio'}
            </button>
          </div>
      }
      <form className={
        `flex flex-col justify-center items-center ${!isEditing
          ? 'hidden'
          : 'block'}`}
      >
        <textarea
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          className='m-auto min-w-10 text-black'
          rows={10}
        />
        <button
          onClick={(e) => handleSave(e)}
          className='m-auto'
        >Save</button>
      </form>
    </div>
  )
}
