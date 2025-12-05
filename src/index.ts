import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import {
  H3,
  eventHandler,
  getCookie,
  getQuery,
  setCookie,
} from 'h3'
import { toNodeHandler } from 'h3/node'
import { nanoid } from 'nanoid'

const app = new H3()
const port = 7416

// A 1x1 transparent image.
const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
)

app.get('/pixel', eventHandler(async (event) => {
    const query = getQuery(event)

    // Check for existing cookie
    let tracking_id = getCookie(event, 'tracking_id')
    const isNewVisitor = !tracking_id

    if (!tracking_id) {
      tracking_id = nanoid()

      // Set tracking cookie
      setCookie(event, 'tracking_id', tracking_id, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'none', // Required for cross-site tracking
        secure: true,
      })
    }

    // Log hit
    console.dir({
      ip: event.req.ip,
      isNewVisitor,
      query,
      timestamp: new Date().toISOString(),
      user_agent: event.req.headers.get('user-agent'),
      tracking_id: tracking_id,
    }, { depth: null })

    event.res.headers.append('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    event.res.headers.append('Content-Length', pixel.length.toString())
    event.res.headers.append('Content-Type', 'image/gif')

    return pixel
  }),
)

// Start HTTP server
createServer(toNodeHandler(app)).listen(port, () => {
  console.log(`Pixel server running on http://localhost:${port}/pixel`)
})
