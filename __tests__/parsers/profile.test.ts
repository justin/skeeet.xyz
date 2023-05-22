import { default as bsky } from '@atproto/api'
const { BskyAgent } = bsky
import * as dotenv from 'dotenv'
import { parseProfile } from '../../src/parsers/profile'

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

    if (!result.success) {
      fail('Authentication failed')
    }
  })
  it('parse a user profile', async () => {
    const profile = await parseProfile('https://staging.bsky.app/profile/chinchillazilla.hellthread.vet', agent)
    expect(profile).toBeDefined()

    expect(profile.displayName.length).toBeGreaterThan(0)
    expect(profile.handle.length).toBeGreaterThan(0)
  })
})
