import { BskyAgent } from '@atproto/api'

type ProfilePayload = {
  displayName: string
  handle: string
  avatar: string
  bio: string
  link: string
}

export async function parseProfile(url: string, agent: BskyAgent): Promise<ProfilePayload> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]

  const profile = await agent.app.bsky.actor.getProfile({ actor: actor })
  if (profile.success) {
    const options = {
      displayName: profile.data.displayName,
      handle: profile.data.handle,
      avatar: profile.data.avatar,
      bio: profile.data.description,
      link: parsedUrl.toString(),
    } as ProfilePayload
    return options
  } else {
    console.error(`Failed to get profile for ${actor}`)
    throw new Error(`Failed to get profile for ${actor}`)
  }
}
