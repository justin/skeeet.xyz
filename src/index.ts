import { AppBskyEmbedImages, AppBskyFeedDefs, default as bsky, default as pkg } from '@atproto/api'
import * as dotenv from 'dotenv'
import express from 'express'
import { exit } from 'process'
import { URL } from 'url'
const { BskyAgent } = bsky
const { AppBskyFeedPost } = pkg

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
app.set('view engine', 'hbs')
app.use(express.json())

app.get('/', async (req, res) => {
  const url = req.query.url as string
  if (!url) {
    res.status(400).send('URL is required')
    return
  }

  try {
    const parsedUrl = new URL(url)
    const path = parsedUrl.pathname
    const parts = path.split('/')
    const actor = parts[2]
    const id = parts[4]

    if (parsedUrl.host == 'bsky.app') {
      // Update the URL to use the host staging.bsky.app
      parsedUrl.host = 'staging.bsky.app'
    }

    console.debug(`Attempting to build OG tags for ${parsedUrl}`)

    const profile = await agent.app.bsky.actor.getProfile({ actor: actor })
    const did = profile.data.did
    const post = await agent.app.bsky.feed.getPostThread({
      uri: `at://${did}/app.bsky.feed.post/${id}`,
      depth: 0,
    })

    if (AppBskyFeedPost.validateEntity(post.data)) {
      const postView = post.data.thread.post as AppBskyFeedDefs.PostView

      let text = ''
      if ('text' in postView.record) {
        text = postView.record.text as string
      }
      let thumb = ''
      if (postView.embed?.media) {
        const media = postView.embed?.media as AppBskyEmbedImages.Main
        if ('thumb' in media.images[0]) {
          thumb = media.images[0].thumb as string
        }
      }

      if (postView.embed?.images) {
        const images = postView.embed?.images as [AppBskyEmbedImages.ViewImage]
        if (images[0] != undefined) {
          thumb = images[0].thumb
        }
      }

      res.set('Content-Type', 'text/html; charset=UTF-8')
      const options = {
        title: `${postView.author.displayName} (${postView.author.handle})`,
        text: text,
        avatar: postView.author.avatar,
        thumb: thumb,
        link: parsedUrl.toString(),
      }
      res.render('skeet', options)
    }
  } catch (err) {
    res.status(400).send(`Invalid URL ${url} ${err}`)
  }
})

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})
