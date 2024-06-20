import Pusher from 'pusher'
import pusherJs from 'pusher-js'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
})

// // eslint-disable-next-line new-cap
// export const jsPusher = new pusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY, {
//   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
// })

let jsPusher = null

export function getPusherJsInstance () {
  if (!jsPusher) {
    // eslint-disable-next-line new-cap
    jsPusher = new pusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    })
  }
  return jsPusher
}
