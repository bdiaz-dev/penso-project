'use client'

import { useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import Image from 'next/image'
import Link from 'next/link'

export default function SearchButton () {
  const [isSearching, setIsSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const textAreaRef = useRef()

  useEffect(() => {
    if (!isSearching) return
    textAreaRef.current.focus()
  }, [isSearching])

  useEffect(() => {
    setSearchResults(null)
    if (searchText.length < 1) return
    const fetchSearch = debounce((inputValue) => {
      fetch(`/api/search?input=${inputValue}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          setSearchResults(data)
        })
    }, 500)

    fetchSearch(searchText)

    return () => {
      fetchSearch.cancel()
    }
  }, [searchText])

  const handleCancel = () => {
    setSearchText('')
    setSearchResults(null)
    setIsSearching(false)
  }
  return (
    <div>
      {
        isSearching
          ? <div className='bg-white rounded-full flex justify-center items-center px-1 pl-4'>
            <textarea className='text-black p-1 text-xs bg-none resize-none border-none outline-none'
              rows={1}
              value={searchText}
              ref={textAreaRef}
              onChange={(e) => { setSearchText(e.target.value) }} />
            <button className='text-sm p-1' onClick={handleCancel}>❌</button>
            {
              searchResults &&
              <div className='absolute top-11 bg-slate-700 text-white rounded flex flex-row gap-4'>

                {/* Users search result */}
                {searchResults?.users?.length > 0 &&
                  <ul className='flex flex-col gap-1 mb-2'>
                    <h2 className='text-center underline'>Users</h2>
                    {searchResults.users.map((user) => (
                      <Link key={user.nickName} className='p-2 flex flex-row gap-4 items-center justify-between text-sm hover:bg-blue-600 cursor-pointer rounded'
                        href={`/user/${user.nickName}`}
                        onClick={handleCancel}>
                        <div className='flex flex-row gap-1'>
                          <Image
                            className='rounded-full'
                            alt='🙂'
                            src={user.avatar}
                            width={20}
                            height={20} />
                          <p>{user.nickName}</p>
                        </div>
                        <div className='flex flex-row gap-1'>
                          <p>{`👁‍🗨 ${user._count.followers}`}</p>
                          <p>{`🔥 ${user.streakCount}`}</p>
                        </div>
                      </Link>))}
                  </ul>
                }

                {/* Hashtags search result */}
                  {searchResults?.hashtags?.length > 0 &&
                <ul className={`flex flex-col gap-1 mb-2 ${searchResults?.users.length > 0 && 'border-l-2'}`}>
                  <h2 className='text-center underline'>Hashtags</h2>
                    {searchResults.hashtags.map((tag) => (
                      <Link key={tag.tag} className='mx-4 p-2 flex flex-row gap-4 items-center text-sm hover:bg-blue-600 cursor-pointer rounded'
                        href={`/searchByTag/${tag.tag}`}
                        onClick={handleCancel}>
                        <div className='flex flex-row gap-4 items-center justify-between flex-grow'>
                          <b>{tag.tag}</b>
                          <b>{`${tag._count.posts}`}</b>
                        </div>
                      </Link>))}
                </ul>}
              </div>
            }
          </div>
          : <button onClick={() => { setIsSearching(true) }}>🔍</button>
      }
    </div>
  )
}
