import { BskyAgent } from '@atproto/api'

export async function parseProfile(url: string, agent: BskyAgent): Promise<any> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]
  const id = parts[4]

  const profile = await agent.app.bsky.actor.getProfile({ actor: actor })
  if (profile.success) {
    return profile.data
  } else {
    console.error(`Failed to get profile for ${actor}`)
    throw new Error(`Failed to get profile for ${actor}`)
  }
}
