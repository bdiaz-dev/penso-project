'use client'

import { useState, useEffect } from 'react'
import { debounce } from 'lodash'

export default function HashtagsForm ({ handleSetTags, initialTagsList }) {
  const [input, setInput] = useState('')
  const [list, setList] = useState([])
  const [tagsSelected, setTagsSelected] = useState(initialTagsList || [])

  useEffect(() => {
    // console.log(initialTagsList)
    setList([])
    if (!input) return
    const fetchHashtags = debounce((inputValue) => {
      fetch(`/api/hashtags/${inputValue}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.some((e) => e.tag === inputValue)) {
            setList(data)
          } else {
            setList([{ id: null, tag: inputValue, count: 'new' }, ...data])
          }
        })
    }, 500)

    fetchHashtags(input)

    return () => {
      fetchHashtags.cancel()
    }
  }, [input])

  const handleDeleteTags = (i) => {
    const newTagsSelected = [...tagsSelected]
    newTagsSelected.splice(i, 1)
    setTagsSelected(newTagsSelected)
  }

  return (
    <div>
      <div className='py-5 text-black flex flex-col'>

        <h2 className='text-white text-2xl mb-5'>
          Hashtags
        </h2>
        {/* <label htmlFor='hashtags' className='text-white'>Search here Hashtags:</label> */}
        <input placeholder='Search here your Hashtags' list="hashtagsList" id="hashtags" name="hashtags" value={input} onChange={(e) => setInput(e.target.value)} className='text-black w-52' />
        <ul className='flex gap-2 py-4' id="hashtagsList" >

          {list.map((tag, index) => {
            if (tagsSelected.some((e) => e.tag === tag.tag)) {
              return ([])
            } else {
              return (
                <li className='bg-slate-600 p-2 rounded cursor-pointer' key={index} onClick={(e) => {
                  const newListTagsSelected = [...tagsSelected, list[index]]
                  setTagsSelected(newListTagsSelected)
                  list.splice(index, 1)
                  handleSetTags(newListTagsSelected)
                }}>
                  {`${tag.tag} [${tag.count}]`}
                </li>
              )
            }
          }
          )}

        </ul>

        <hr />

        <h2 className='text-white'>
          Tags selected
        </h2>

        <ul className='flex gap-2 py-4 text-white'>
          {
            tagsSelected.map((tag, index) => (
              <li className='bg-slate-600 p-2 rounded flex flex-row items-center gap-1' key={index}>
                {tag.tag}
                <span
                  onClick={() => { handleDeleteTags(index); console.log(tagsSelected) }}
                  className=' cursor-pointer text-gray-800 hover:text-red-700 font-bold text-xl'
                >
                  {'✖'}
                </span>
              </li>
            ))
          }
        </ul>

      </div>
    </div >
  )
}
