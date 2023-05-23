import { BskyAgent } from '@atproto/api'
import * as dotenv from 'dotenv'
import { parseSkeet } from '../../src/parsers/skeet_parser'

describe('Parsing skeets', () => {
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
  it('parse a skeet with an image', async () => {
    const result = await parseSkeet(
      'https://staging.bsky.app/profile/chinchillazilla.hellthread.vet/post/3jvhqs4j6kw2n',
      agent
    )
    expect(result).toBeDefined()
    expect(result.title).toBe('Chinchillazilla (chinchillazilla.hellthread.vet)')
    expect(result.link).toBe('https://staging.bsky.app/profile/chinchillazilla.hellthread.vet/post/3jvhqs4j6kw2n')
    expect(result.avatar).toBeDefined()
    expect(result.thumb).toBeDefined()
    if (result.thumb) {
      expect(result.thumb.length).toBeGreaterThan(0)
    }
    expect(result.text).toContain("Here is an artist's rendering, anyway.")
  })

  it('parse a skeet with just text', async () => {
    const result = await parseSkeet('https://staging.bsky.app/profile/pfrazee.com/post/3jvhz4cv3yd2y', agent)
    expect(result).toBeDefined()
    expect(result.title).toContain('(pfrazee.com)')
    expect(result.link).toBe('https://staging.bsky.app/profile/pfrazee.com/post/3jvhz4cv3yd2y')
    expect(result.avatar).toBeDefined()
    expect(result.thumb).toBeDefined()
    if (result.thumb) {
      expect(result.thumb.length).toBeGreaterThan(0)
    }
    expect(result.text).toContain('this is a public network! your profile, posts, and likes are public!')
  })

  it('parse a quote skeet with an image', async () => {
    const result = await parseSkeet('https://staging.bsky.app/profile/rationalblonde.com/post/3jvi52bmci42h', agent)
    expect(result).toBeDefined()
    expect(result.title).toContain('(rationalblonde.com)')
    expect(result.link).toBe('https://staging.bsky.app/profile/rationalblonde.com/post/3jvi52bmci42h')
    expect(result.avatar).toBeDefined()
    expect(result.thumb).toBeDefined()
    if (result.thumb) {
      expect(result.thumb.length).toBeGreaterThan(0)
    }
    expect(result.text).toContain("she's back baby")
  })

  it('parse a quote skeet with multiple images', async () => {
    const result = await parseSkeet('https://staging.bsky.app/profile/jaketapper.bsky.social/post/3jvicacjl4c2o', agent)
    expect(result).toBeDefined()
    expect(result.title).toContain('(jaketapper.bsky.social)')
    expect(result.link).toBe('https://staging.bsky.app/profile/jaketapper.bsky.social/post/3jvicacjl4c2o')
    expect(result.avatar).toBeDefined()
    expect(result.thumb).toBeDefined()
    if (result.thumb) {
      expect(result.thumb.length).toBeGreaterThan(0)
    }
    expect(result.text).toContain('I offer you these two images from A.I. depicting a hell rope')
  })
})
