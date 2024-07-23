'use client'

import { useState } from 'react'

export default function SearchButton () {
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  console.log(isSearching)

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchText(e.target.value)
  }
  const handleCancel = () => {
    setSearchText('')
    setIsSearching(false)
  }
  return (
    <div>
      {
        isSearching
          ? <div className='bg-white rounded-full flex justify-center items-center px-1 pl-4'>
            <textarea className='text-black p-1 text-xs bg-none resize-none border-none outline-none'
            rows={1}>{searchText}</textarea>
            <button className='text-sm p-1' onClick={handleCancel}>❌</button>
          </div>
          : <button onClick={() => {setIsSearching(true)}}>🔍</button>
      }
    </div>
  )
}
