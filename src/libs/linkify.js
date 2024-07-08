import React from 'react'

export default function linkify (text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line.split(urlRegex).map((part, idx) => {
        if (part.match(urlRegex)) {
          return <a key={idx} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
        } else {
          return part
        }
      })}
      <br />
    </React.Fragment>
  ))
  return parts
}
