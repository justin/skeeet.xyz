import { BskyAgent } from '@atproto/api'
import * as dotenv from 'dotenv'
import { parseProfile } from '../../src/parsers/profile_parser'

describe('Parsing profiles', () => {
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  })

  beforeAll(async () => {
    dotenv.config()
    const result = await agent.login({
      identifier: process.env.BSKY_USERNAME!,
      password: process.env.BSKY_PASSWORD!,
    })

    expect(result.success).toBe(true)
  })
  it('parse a user profile', async () => {
    const profile = await parseProfile('https://staging.bsky.app/profile/chinchillazilla.hellthread.vet', agent)
    expect(profile).toBeDefined()

    expect(profile.displayName.length).toBeGreaterThan(0)
    expect(profile.handle.length).toBeGreaterThan(0)
  })
})
