/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export type Env = {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	DB: KVNamespace;
}

import { Hono } from 'hono';
// new hono app
const app = new Hono<{Bindings: Env}>()

app.get('/get/:key', async (c, next)=> {
	const key = c.req.param('key')
	// Fetch the value from the KV store
	const base64Image = await c.env.DB.get(key)
	if (!base64Image) {
	  return c.text('Image not found', 404)
	}
	// Decode the base64 string to binary data
	const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0))
	// Return the image as a response
	return new Response(imageBuffer, {
	  headers: {
		'Content-Type': 'image/jpeg' // Change this to the correct image type if needed
	  }
	})
})

app.get('/', async (c, next) => {
	return c.text('Hello, world!')
  
})

app.put('/put/:key', async (c, next) => {
	const key = c.req.param('key')
	// Get the base64 encoded image from the request body
	const base64Image = await c.req.text()
	// Delete the old value if it exists
	console.log('Deleting: ', key)
	try {await c.env.DB.delete(key)
	// Store the new base64 encoded image into the KV store
	await c.env.DB.put(key, base64Image)
	return c.text('Image stored successfully')
	}
	catch (e) {
		return c.text('Error', 500)
	}
  })

export default app;