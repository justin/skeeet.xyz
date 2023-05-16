import { AppBskyEmbedImages, AppBskyFeedDefs, BskyAgent, default as pkg } from '@atproto/api'
const { AppBskyFeedPost } = pkg

type SkeetPayload = {
  title: string
  text: string
  avatar: string
  thumb: string | undefined
  link: string
}

export async function parseSkeet(url: string, agent: BskyAgent): Promise<SkeetPayload> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]
  const id = parts[4]

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

    const options = {
      title: `${postView.author.displayName} (${postView.author.handle})`,
      text: text,
      avatar: postView.author.avatar,
      thumb: thumb,
      link: parsedUrl.toString(),
    } as SkeetPayload

    return options
  } else {
    throw new Error(`Failed to get post ${id}`)
  }
}
