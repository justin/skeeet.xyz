import { describe, it, expect } from 'vitest'
import { ExternalEmbed } from '../../src/types/external_embed'
import * as BlueSky from '@atproto/api'

describe('ExternalEmbed', () => {
  describe('constructor', () => {
    it('should create an instance from a BlueSky external', () => {
      const external: BlueSky.AppBskyEmbedExternal.ViewExternal = {
        uri: 'https://example.com',
        title: 'Example',
        description: 'An example',
        thumb: 'https://example.com/thumb.png',
      }
      const embed = new ExternalEmbed(external)
      expect(embed.uri).toEqual(external.uri)
      expect(embed.title).toEqual(external.title)
      expect(embed.description).toEqual(external.description)
    })

    it('should create an instance from individual properties', () => {
      const uri = 'https://example.com'
      const title = 'Example'
      const description = 'An example'
      const thumb = 'https://example.com/thumb.png'
      const embed = new ExternalEmbed(uri, title, description, thumb)
      expect(embed.uri).toEqual(uri)
      expect(embed.title).toEqual(title)
      expect(embed.description).toEqual(description)
      expect(embed.thumb).toEqual(new URL(thumb))
    })

    it('should create an instance without a thumb', () => {
      const uri = 'https://example.com'
      const title = 'Example'
      const description = 'An example'
      const embed = new ExternalEmbed(uri, title, description)
      expect(embed.uri).toEqual(uri)
      expect(embed.title).toEqual(title)
      expect(embed.description).toEqual(description)
      expect(embed.thumb).toBeUndefined()
    })
  })
})
