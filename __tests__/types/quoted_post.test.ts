import { randomUUID } from 'crypto'
import { QuotedPost } from '../../src/types/quoted_post'

describe('QuotedPost', () => {
  describe('formattedRelativeDate', () => {
    it('returns undefined if dateCreated is undefined', () => {
      const post = new QuotedPost({
        uri: randomUUID().toString(),
        cid: randomUUID().toString(),
        author: {
          did: 'did:example:123',
          handle: 'jww.wtf',
          displayName: 'Justin W',
        },
        value: {
          text: 'Hello, world!',
        },
        indexedAt: '2022-01-01T00:00:00Z',
      })
      expect(post.formattedRelativeDate()).toBeUndefined()
    })

    it('returns a formatted relative date if dateCreated is defined', () => {
      const post = new QuotedPost({
        uri: randomUUID().toString(),
        cid: randomUUID().toString(),
        author: {
          did: 'did:example:123',
          handle: 'jww.wtf',
          displayName: 'Justin W',
        },
        value: {
          text: 'Hello, world!',
          createdAt: '2022-01-01T00:00:00Z',
        },
        indexedAt: '2022-01-01T00:00:00Z',
      })
      expect(post.formattedRelativeDate()).toEqual('1y')
    })
  })
})
