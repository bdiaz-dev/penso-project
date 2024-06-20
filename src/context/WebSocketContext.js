'use client'

import React, { createContext, useContext, useEffect, useRef } from 'react'

const WebSocketContext = createContext(null)

export const WebSocketProvider = ({ children }) => {
  const socket = useRef(null)

  useEffect(() => {
    socket.current = new WebSocket('wss://your-websocket-server-url')

    socket.current.onopen = () => {
      console.log('WebSocket connected')
    }

    socket.current.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return () => {
      socket.current.close()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={socket.current}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => {
  return useContext(WebSocketContext)
}
