import { BskyAgent } from '@atproto/api'
import * as dotenv from 'dotenv'
import { parseSkeetURL } from '../../src/parsers/skeet_parser'

describe('Skeet Parsing', () => {
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

  describe('Plain Text Only', () => {
    it('should parse a skeet with just text', async () => {
      const result = await parseSkeetURL('https://staging.bsky.app/profile/pfrazee.com/post/3jvhz4cv3yd2y', agent)
      expect(result).toBeDefined()
      expect(result.title).toContain('(pfrazee.com)')
      expect(result.link).toBe('https://bsky.app/profile/pfrazee.com/post/3jvhz4cv3yd2y')
      expect(result.avatar).toBeDefined()
      expect(result.text).toContain('this is a public network! your profile, posts, and likes are public!')
      expect(result.quotedPost).toBeUndefined()
    })

    it('should parse a skeet with no replies or parents', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/jesseltaylor.bsky.social/post/3jwgct3nro426', agent)
      expect(result).toBeDefined()
      expect(result.images.length).toBe(0)
      expect(result.quotedPost).toBeUndefined()
    })
  })

  describe('Quote Skeets', () => {
    it('should parse a quote skeet', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/susanrinkunas.bsky.social/post/3jwhxhysnq72m', agent)
      expect(result).toBeDefined()
      expect(result.title).toContain('(susanrinkunas.bsky.social)')
      expect(result.link).toBe('https://bsky.app/profile/susanrinkunas.bsky.social/post/3jwhxhysnq72m')
      expect(result.avatar).toBeDefined()
      expect(result.images.length).toBe(0)
      expect(result.text).toBe(
        'Chuck Schumer deserves a lot more blame for the fall of Roe than he gets, which is zero'
      )

      const quotedPost = result.quotedPost
      expect(quotedPost).toBeDefined()
      expect(quotedPost?.handle).toBe('mommunism.bsky.social')
      expect(quotedPost?.avatar).toBeDefined()
      expect(quotedPost?.text).toBe(
        'One day I’m also gonna write something about how the response to the Merrick Garland stuff (where we really lost the court) was just a bunch of Dems being like “look how hypocritical they are being” as opposed to I don’t know trying to WEILD POLITICAL POWER'
      )
      expect(quotedPost?.link.toString()).toBe('https://bsky.app/profile/mommunism.bsky.social/post/3jwhsamht4325')
      expect(quotedPost?.date).toBeDefined()
    })
  })
  describe('Image Parsing', () => {
    it('should parse a skeet with an image', async () => {
      const result = await parseSkeetURL(
        'https://staging.bsky.app/profile/ankhmorporkcity.watch/post/3jvhqs4j6kw2n',
        agent
      )
      expect(result).toBeDefined()
      expect(result.title).toBe('Chinchillazilla (ankhmorporkcity.watch)')
      expect(result.link).toBe('https://bsky.app/profile/ankhmorporkcity.watch/post/3jvhqs4j6kw2n')
      expect(result.avatar).toBeDefined()
      expect(result.images.length).toBe(1)
      expect(result.text).toContain("Here is an artist's rendering, anyway.")
      expect(result.quotedPost).toBeUndefined()
    })

    it('should parse a reskeet with an image', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/rachelskirts.com/post/3jw3uhuq2w32j', agent)
      expect(result).toBeDefined()
      expect(result.images.length).toBe(1)

      const quotedPost = result.quotedPost
      expect(quotedPost).toBeDefined()
      expect(quotedPost?.handle).toBe('bnb.im')
      expect(quotedPost?.text).toBe('can everyone reply or quote this with your favorite selfie, I wanna see something')
    })

    it('should parse a quote skeet with an image', async () => {
      const result = await parseSkeetURL(
        'https://staging.bsky.app/profile/rationalblonde.com/post/3jvi52bmci42h',
        agent
      )
      expect(result).toBeDefined()
      expect(result.title).toContain('(rationalblonde.com)')
      expect(result.link).toBe('https://bsky.app/profile/rationalblonde.com/post/3jvi52bmci42h')
      expect(result.avatar).toBeDefined()
      expect(result.images.length).toBe(1)
      expect(result.text).toContain("she's back baby")

      expect(result.quotedPost).toBeDefined()
    })

    it('should parse a quote skeet with multiple images', async () => {
      const result = await parseSkeetURL(
        'https://staging.bsky.app/profile/jaketapper.bsky.social/post/3jvicacjl4c2o',
        agent
      )
      expect(result).toBeDefined()
      expect(result.title).toContain('(jaketapper.bsky.social)')
      expect(result.link).toBe('https://bsky.app/profile/jaketapper.bsky.social/post/3jvicacjl4c2o')
      expect(result.avatar).toBeDefined()
      expect(result.images.length).toBe(2)
      expect(result.text).toContain('I offer you these two images from A.I. depicting a hell rope')

      expect(result.quotedPost).toBeUndefined()
    })

    it('should parse reskeets', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/gaberivera.bsky.social/post/3jwlhzcxqgl2o', agent)

      expect(result).toBeDefined()
      expect(result.reskeets).toBeGreaterThanOrEqual(15)
      expect(result.likes).toBeGreaterThanOrEqual(65)
    })
  })

  describe('Link Parsing', () => {
    it('should parse a skeet with a link', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/miriamm.bsky.social/post/3jwv4jtlgfc2x', agent)
      expect(result).toBeDefined()

      expect(result.externalLink).toBeDefined()
      const externalLink = result.externalLink
      expect(externalLink?.title).toBe('Gladis the killer whale and her gang of orcas out for revenge')
      expect(externalLink?.description).toBe('Why are orcas attacking boats?')
      expect(externalLink?.image).toBeDefined()
      expect(externalLink?.url).toBe(
        'https://www.independent.co.uk/news/world/europe/gladis-whale-orca-boat-attacks-gibraltar-b2347572.html'
      )
    })
  })

  describe('Parent Skeet Parsing', () => {
    it('should parse the parent reply for a skeet with only text', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/msh.blue/post/3jw4f2qhmct2c', agent)
      expect(result).toBeDefined()

      const parent = result.parentPost
      expect(parent).toBeDefined()
      expect(parent?.handle).toBe('natanael.bsky.social')
      expect(parent?.text.length).toBeGreaterThan(0)
    })

    it('should parse the parent reply for a skeet with only media', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/bnb.im/post/3jw3zhvyetg2u', agent)
      expect(result).toBeDefined()

      const parent = result.parentPost
      expect(parent).toBeDefined()
      expect(parent?.handle).toBe('rachelskirts.com')
      expect(parent?.images.length).toBe(1)
    })
  })

  describe('Rich text parsing', () => {
    it('should parse an earthquake tweet with rich text', async () => {
      const result = await parseSkeetURL('https://bsky.app/profile/earthquake.bsky.social/post/3jxbdefhx442e', agent)
      expect(result).toBeDefined()

      const entities = result.post.entities
      expect(entities).toBeDefined()
      expect(entities?.length).toBe(2)
    })
  })
})
