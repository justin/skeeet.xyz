import * as BlueSky from '@atproto/api'
import linkifyStr from 'linkify-string'
import { Profile } from '../types/profile'
import { Post, PostImage } from '../types/post'

type SkeetPayload = {
  post: Post
  title: string
  displayName: string
  handle: string
  text: string
  date: string | undefined
  time: string | undefined
  relativeDate: string | undefined
  avatar: string
  link: string
  images: PostImage[]
  externalLink?: {
    title: string
    description: string
    image: string
    url: URL
  }
  reskeets: number
  likes: number
  parentPost?: SkeetPayload
  quotedPost?: {
    post: Post
    text: string
    date: string | undefined
    avatar: string
    link: string
    handle: string
    displayName: string
  }
}

const defaultLang = `en-US`

type ThreadViewPost = BlueSky.AppBskyFeedDefs.ThreadViewPost
type PostView = BlueSky.AppBskyFeedDefs.PostView

export async function parseSkeetURL(
  url: string,
  agent: BlueSky.BskyAgent,
  locale = defaultLang
): Promise<SkeetPayload> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]
  const id = parts[4]
  console.debug(`Attempting to build OG tags for ${parsedUrl}`)

  return parseSkeet(actor, id, agent, locale)
}

export async function parseSkeet(
  handle: string,
  id: string,
  agent: BlueSky.BskyAgent,
  locale = defaultLang
): Promise<SkeetPayload> {
  let parsedLocale = locale.includes(',') ? locale.split(',')[0] : locale

  if (parsedLocale.includes('*')) {
    parsedLocale = defaultLang
  }

  const profileResult = await agent.getProfile({ actor: handle })
  const profile = new Profile(profileResult.data)

  const did = profile.did
  const uri = `at://${did}/app.bsky.feed.post/${id}`
  const postThreadResponse = await agent.getPostThread({
    uri: uri,
    depth: 0,
  })

  const thread = postThreadResponse.data.thread as ThreadViewPost
  const threadValidation = BlueSky.AppBskyFeedDefs.validateThreadViewPost(thread)
  if (threadValidation.success) {
    // The requested post.
    const postView = postThreadResponse.data.thread.post as PostView
    const post = new Post(postView)

    let parent: Post | undefined
    const parentThread = postThreadResponse.data.thread.parent as ThreadViewPost
    if (parentThread) {
      const parentView = parentThread.post as PostView
      parent = new Post(parentView)
    }

    const links = {
      validate: {
        url: (value: string) => /^(http|https):\/\//.test(value),
      },
    }

    const options = {
      post: post,
      title: `${profile.displayName} (${profile.handle})`,
      displayName: profile.displayName,
      handle: profile.handle,
      text: linkifyStr(post.text, links),
      isoDate: post.dateCreated?.toISOString(),
      metaText: post.metaText,
      relativeDate: post.formattedRelativeDate(),
      date: post.formattedDate(parsedLocale),
      time: post.formattedTime(parsedLocale),
      avatar: profile.avatar,
      link: post.url.toString(),
      likes: post.likeCount ?? 0,
      reskeets: post.reskeetCount ?? 0,
      images: post.images,
      externalLink: post.externalLink ? post.externalLink.toPayload() : undefined,
      parentPost: parent
        ? {
            post: parent.post,
            title: `${parent.profile.displayName} (${parent.profile.handle})`,
            displayName: parent.profile.displayName,
            handle: parent.profile.handle,
            text: linkifyStr(parent.text, links),
            relativeDate: parent.formattedRelativeDate(),
            date: parent.formattedDate(parsedLocale),
            time: parent.formattedTime(parsedLocale),
            avatar: parent.profile.avatar,
            link: parent.url.toString(),
            likes: 0,
            reskeets: 0,
            images: parent.images,
            externalLink: post.externalLink,
            quotedPost: parent.quotedPost
              ? {
                  text: parent.quotedPost.text,
                  date: parent.quotedPost.formattedRelativeDate(),
                  avatar: parent.quotedPost.profile.avatar,
                  link: parent.quotedPost.url.toString(),
                  handle: parent.quotedPost.profile.handle,
                  displayName: parent.quotedPost.profile.displayName,
                }
              : undefined,
          }
        : undefined,
      quotedPost: post.quotedPost
        ? {
            text: post.quotedPost.text,
            date: post.quotedPost.formattedRelativeDate(),
            avatar: post.quotedPost.profile.avatar,
            link: post.quotedPost.url.toString(),
            handle: post.quotedPost.profile.handle,
            displayName: post.quotedPost.profile.displayName,
          }
        : undefined,
    } as SkeetPayload
    return options
  } else {
    throw new Error(`Failed to get post ${id}: ${threadValidation.error}`)
  }
}
