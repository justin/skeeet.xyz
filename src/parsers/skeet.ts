import { AppBskyEmbedImages, AppBskyFeedDefs, BskyAgent, AppBskyFeedPost } from '@atproto/api'
import linkifyStr from 'linkify-string'

type SkeetPayload = {
  title: string
  displayName: string
  handle: string
  text: string
  date: string | undefined
  time: string | undefined
  avatar: string
  thumb: string | undefined
  link: string
  images: AppBskyEmbedImages.ViewImage[]
}

const defaultLang = `en-US`

export async function parseSkeet(url: string, agent: BskyAgent, locale = defaultLang): Promise<SkeetPayload> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]
  const id = parts[4]
  let parsedLocale = locale.includes(',') ? locale.split(',')[0] : locale

  if (parsedLocale.includes('*')) {
    parsedLocale = defaultLang
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

    let images: AppBskyEmbedImages.ViewImage[] = []
    if (postView.embed?.images) {
      images = postView.embed?.images as [AppBskyEmbedImages.ViewImage]
      if (images[0] != undefined) {
        thumb = images[0].thumb
      }
    }

    let date: Date | undefined
    let time: Date | undefined
    if ('createdAt' in postView.record) {
      console.debug(`Post date: ${postView.record.createdAt as Date}`)
      date = new Date(Date.parse(postView.record.createdAt as string))
      time = date
    }

    const links = {
      validate: {
        url: (value: string) => /^(http|https):\/\//.test(value),
      },
    }

    const options = {
      title: `${postView.author.displayName} (${postView.author.handle})`,
      displayName: postView.author.displayName,
      handle: postView.author.handle,
      text: linkifyStr(text, links),
      date: date?.toLocaleDateString(parsedLocale, { year: 'numeric', month: 'long', day: 'numeric' }),
      time: time?.toLocaleTimeString(parsedLocale, { hour: 'numeric', minute: 'numeric' }),
      avatar: postView.author.avatar,
      thumb: thumb,
      link: parsedUrl.toString(),
      likes: postView.likeCount ?? 0,
      reskeets: postView.reskeetCount ?? 0,
      images: images,
    } as SkeetPayload
    return options
  } else {
    throw new Error(`Failed to get post ${id}`)
  }
}
