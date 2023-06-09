import * as BlueSky from '@atproto/api'
import * as dotenv from 'dotenv'
import express from 'express'
import { create } from 'express-handlebars'
import { exit } from 'process'
import { parseSkeet, parseSkeetURL } from './parsers/skeet_parser.js'
import { parseProfile } from './parsers/profile_parser.js'
import { formattedPostText } from './utils/rich_text_helper.js'
import Handlebars from 'handlebars'
import { Profile } from './types/profile.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
const hbs = create({
  extname: '.hbs',
  partialsDir: 'views/partials',
  layoutsDir: 'views/layouts',
})

Handlebars.registerHelper('richText', formattedPostText)

app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')
app.use(express.json())
app.use(express.static('public'))

app.use(
  '/.well-known',
  express.static('.well-known', {
    setHeaders: (res) => res.setHeader('Content-Type', 'application/json'),
  })
)

const agent = new BlueSky.BskyAgent({
  service: 'https://bsky.social',
})

agent
  .login({
    identifier: process.env.BSKY_USERNAME!,
    password: process.env.BSKY_PASSWORD!,
  })
  .then((result) => {
    if (result.success) {
      console.log('Signed in')
    } else {
      console.log('Failed to sign in')
      exit(1)
    }
  })

app.post('/api/skeet', async (req, res) => {
  const url = req.body.url as string
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  try {
    const result = await parseSkeetURL(url, agent, req.headers['accept-language'])
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
  res.set('Content-Type', 'text/html; charset=UTF-8')
  if (!url) {
    res.render('index', { layout: false })
    return
  }

  try {
    const pathName = new URL(url).pathname.split('/')
    switch (pathName.length) {
      case 3: {
        const result = await parseProfile(url, agent)
        res.render('profile', { profile: result, layout: false })
        break
      }
      default: {
        const result = await parseSkeetURL(url, agent, req.headers['accept-language'])
        res.render('skeet', {
          skeet: result,
        })
        break
      }
    }
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`)
  }
})

app.get('/profile/:handle', async (req, res) => {
  const handle = req.params.handle

  try {
    const profileResponse = await agent.getProfile({ actor: handle })
    if (profileResponse.success) {
      const profile = new Profile(profileResponse.data)
      res.render('profile', { profile: profile, layout: false })
    } else {
      console.error(`Failed to get profile for ${handle}`)
      throw new Error(`Failed to get profile for ${handle}`)
    }
  } catch (err) {
    res.status(400).send(err)
  }
})

app.get('/profile/:handle/post/:pid', async (req, res) => {
  const handle = req.params.handle
  const pid = req.params.pid

  try {
    const result = await parseSkeet(handle, pid, agent, req.headers['accept-language'])
    res.set('Content-Type', 'text/html; charset=UTF-8')
    res.render('skeet', {
      skeet: result,
    })
  } catch (err) {
    res.status(400).send(err)
  }
})

app.get('/api/health', async (req, res) => {
  res.send('OK')
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
