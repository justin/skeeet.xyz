import * as BlueSky from '@atproto/api'
import { Profile } from './profile'
import { URL } from 'url'
import { QuotedPost } from './quoted_post'
import { ExternalEmbed } from './external_embed'
import { formattedRelativeDate } from '../utils/relative_dates'

type PostView = BlueSky.AppBskyFeedDefs.PostView
export type PostImage =
  | BlueSky.AppBskyEmbedImages.ViewImage
  | BlueSky.AppBskyEmbedImages.Image
  | BlueSky.AppBskyEmbedImages.Main

export type PostExternalEmbedView = BlueSky.AppBskyEmbedExternal.ViewExternal

enum BlueskyPostEmbedType {
  ImageEmbedType = 'app.bsky.embed.images#view',
  RecordEmbedType = 'app.bsky.embed.record#view',
  RecordWithMediaEmbedType = 'app.bsky.embed.recordWithMedia#view',
  ExternalEmbedType = 'app.bsky.embed.external#view',
}

export class Post {
  post: PostView
  record: object
  profile: Profile

  quotedPost?: QuotedPost

  images: PostImage[] = []

  externalLink?: ExternalEmbed

  facets?: BlueSky.AppBskyRichtextFacet.Main[]

  constructor(post: PostView) {
    this.post = post

    const validation = BlueSky.AppBskyFeedPost.validateRecord(this.post.record)
    if (validation.success) {
      this.record = this.post.record
    } else {
      console.error(`Invalid PostView: ${validation.error}`)
      throw validation.error
    }

    const profileValidation = BlueSky.AppBskyActorDefs.validateProfileViewBasic(this.post.author)
    if (profileValidation.success) {
      this.profile = new Profile(this.post.author)
    } else {
      throw new Error(`Invalid ProfileView ${profileValidation.error}`)
    }

    // If the post has an embed it has a parent skeet and/or images.
    if ('embed' in post) {
      const embed = post.embed
      const embedType = embed?.$type as BlueskyPostEmbedType

      switch (embedType) {
        case BlueskyPostEmbedType.ImageEmbedType: {
          //   console.debug(`Post has image embed type ${embedType}`)
          if (embed?.images) {
            this.images = embed?.images as [PostImage]
          }
          break
        }
        case BlueskyPostEmbedType.RecordEmbedType: {
          //   console.debug(`Post has record embed type ${embedType}`)
          this.quotedPost = new QuotedPost(embed?.record as BlueSky.AppBskyEmbedRecord.ViewRecord)
          break
        }

        case BlueskyPostEmbedType.RecordWithMediaEmbedType: {
          //   console.debug(`Post has record with media embed type ${embedType}`)

          const record = embed?.record as BlueSky.AppBskyEmbedRecord.View
          if (record) {
            this.quotedPost = new QuotedPost(record.record as BlueSky.AppBskyEmbedRecord.ViewRecord)
          }

          if (embed?.media) {
            const media = embed?.media as BlueSky.AppBskyEmbedImages.Main
            this.images = media.images
          }

          break
        }
        case BlueskyPostEmbedType.ExternalEmbedType: {
          //   console.debug(`Post has external embed type ${embedType}`)
          const external = embed?.external as PostExternalEmbedView
          if (external) {
            this.externalLink = new ExternalEmbed(external)
          }
          break
        }
        default: {
          //   console.debug(`Post has no embed type ${embedType}`)
          break
        }
      }
    }

    if ('facets' in this.record && 'text' in this.record) {
      this.facets = this.record.facets as BlueSky.AppBskyRichtextFacet.Main[]
    }
  }

  get dateCreated(): Date | undefined {
    if ('createdAt' in this.record) {
      const dateString = this.record.createdAt as string
      return new Date(Date.parse(dateString))
    }

    return undefined
  }

  get text(): string {
    if ('text' in this.record) {
      return this.record.text as string
    }

    return ''
  }

  get metaText(): string {
    // Remove all newlines and replace with a space
    return this.text.replace(/(\r\n|\n|\r)/gm, ' ')
  }

  get uri(): string {
    return this.post.uri
  }

  get reskeetCount(): number {
    return this.post.repostCount as number
  }

  get likeCount(): number {
    return this.post.likeCount as number
  }

  get url(): URL {
    const components = this.post.uri.split('/')
    const id = components[components.length - 1]
    return new URL(`https://bsky.app/profile/${this.profile.handle}/post/${id}`)
  }

  formattedDate(locale: string): string | undefined {
    return this.dateCreated?.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  formattedTime(locale: string): string | undefined {
    return this.dateCreated?.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric' })
  }

  formattedRelativeDate(): string | undefined {
    if (this.dateCreated) {
      return formattedRelativeDate(this.dateCreated)
    }

    return undefined
  }
}
