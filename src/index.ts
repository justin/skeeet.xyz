import { default as bsky } from '@atproto/api'
import * as dotenv from 'dotenv'
import express from 'express'
import { exit } from 'process'
import { parseSkeet } from './parsers/skeet.js'
import { parseProfile } from './parsers/profile.js'
const { BskyAgent } = bsky

dotenv.config()

const agent = new BskyAgent({
  service: 'https://bsky.social',
})

const result = await agent.login({
  identifier: process.env.BSKY_USERNAME!,
  password: process.env.BSKY_PASSWORD!,
})

if (result.success) {
  console.log('Signed in')
} else {
  console.log('Failed to sign in')
  exit(1)
}

const app = express()
const port = process.env.PORT
app.set('view engine', 'hbs')
app.use(express.json())

app.post('/api/skeet', async (req, res) => {
  const url = req.body.url as string
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  try {
    const result = await parseSkeet(url, agent)
    res.json(result)
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`)
  }
})

app.post('/api/profile', async (req, res) => {
  const url = req.body.url as string
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  try {
    const result = await parseProfile(url, agent)
    res.json(result)
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`)
  }
})

app.get('/', async (req, res) => {
  const url = req.query.url as string
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  try {
    const pathName = new URL(url).pathname.split('/')
    console.debug(pathName)
    switch (pathName.length) {
      case 3: {
        const result = await parseProfile(url, agent)
        res.set('Content-Type', 'text/html; charset=UTF-8')
        res.render('profile', result)
        break
      }
      default: {
        const result = await parseSkeet(url, agent)
        res.set('Content-Type', 'text/html; charset=UTF-8')
        res.render('skeet', result)
        break
      }
    }
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`)
  }
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
