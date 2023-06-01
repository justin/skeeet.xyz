import { BskyAgent } from '@atproto/api'
import { Profile } from '../types/profile'

type ProfilePayload = {
  displayName: string
  handle: string
  avatar: string
  bio: string
  link: string
}

export async function parseProfile(url: string, agent: BskyAgent): Promise<Profile> {
  const parsedUrl = new URL(url)
  const path = parsedUrl.pathname
  const parts = path.split('/')
  const actor = parts[2]

  const profileResponse = await agent.getProfile({ actor: actor })
  if (profileResponse.success) {
    const profile = new Profile(profileResponse.data)

    return profile
  } else {
    console.error(`Failed to get profile for ${actor}`)
    throw new Error(`Failed to get profile for ${actor}`)
  }
}
