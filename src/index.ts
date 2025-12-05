import { createServer } from 'node:http'
import { H3 } from 'h3'
import { toNodeHandler } from 'h3/node'

const app = new H3()
const port = 7416

app.get('/pixel', async (event) => {
  const { handler } = await import('./pixel.ts')

  return handler(event)
})

// Start HTTP server
createServer(toNodeHandler(app)).listen(port, () => {
  console.log(`Pixel server running on http://localhost:${port}/pixel`)
})
