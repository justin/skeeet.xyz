import * as BlueSky from '@atproto/api'
import linkifyStr from 'linkify-string'
import { Profile } from '../types/profile'
import { Post, PostImage } from '../types/post'

type SkeetPayload = {
  title: string
  displayName: string
  handle: string
  text: string
  date: string | undefined
  time: string | undefined
  avatar: string
  link: string
  images: PostImage[]
}

const defaultLang = `en-US`

type ThreadViewPost = BlueSky.AppBskyFeedDefs.ThreadViewPost
type PostView = BlueSky.AppBskyFeedDefs.PostView

export async function parseSkeet(url: string, agent: BlueSky.BskyAgent, locale = defaultLang): Promise<SkeetPayload> {
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

  const profileResult = await agent.getProfile({ actor: actor })
  const profile = new Profile(profileResult.data)

  const did = profile.did
  const postThreadResponse = await agent.getPostThread({
    uri: `at://${did}/app.bsky.feed.post/${id}`,
    depth: 0,
  })

  const thread = postThreadResponse.data.thread as ThreadViewPost
  const threadValidation = BlueSky.AppBskyFeedDefs.validateThreadViewPost(thread)
  if (threadValidation.success) {
    // The requested post.
    const postView = postThreadResponse.data.thread.post as PostView
    const post = new Post(postView)

    const links = {
      validate: {
        url: (value: string) => /^(http|https):\/\//.test(value),
      },
    }

    const options = {
      title: `${profile.displayName} (${profile.handle})`,
      displayName: profile.displayName,
      handle: profile.handle,
      text: linkifyStr(post.text, links),
      date: post.formattedDate(parsedLocale),
      time: post.formattedTime(parsedLocale),
      avatar: profile.avatar,
      link: post.url.toString(),
      likes: postView.likeCount ?? 0,
      reskeets: postView.reskeetCount ?? 0,
      images: post.images,
    } as SkeetPayload
    return options
  } else {
    throw new Error(`Failed to get post ${id}: ${threadValidation.error}`)
  }
}
