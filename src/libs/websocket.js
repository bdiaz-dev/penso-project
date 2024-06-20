import { Server, OPEN } from 'ws'

let wss

const initWebSocketServer = (server) => {
  if (wss) return wss

  wss = new Server({ server })

  wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.on('message', (message) => {
      console.log(`Received message => ${message}`)
    })

    ws.on('close', () => {
      console.log('Client disconnected')
    })
  })

  return wss
}

const broadcast = (data) => {
  if (!wss) {
    console.error('WebSocket server not initialized')
    return
  }

  wss.clients.forEach((client) => {
    if (client.readyState === OPEN) {
      client.send(JSON.stringify(data))
    }
  })
}

export { initWebSocketServer, broadcast }
