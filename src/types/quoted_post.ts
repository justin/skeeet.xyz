import * as BlueSky from '@atproto/api'
import { Profile } from './profile'

export class QuotedPost {
  profile: Profile
  uri: string

  text: string

  value: Record<string, unknown>

  constructor(record: BlueSky.AppBskyEmbedRecord.ViewRecord) {
    this.profile = new Profile(record.author as BlueSky.AppBskyActorDefs.ProfileViewBasic)

    if ('text' in record.value) {
      this.text = record.value.text as string
    } else {
      this.text = ''
    }

    this.value = record.value
    this.uri = record.uri
  }

  get url(): URL {
    const components = this.uri.split('/')
    const id = components[components.length - 1]
    return new URL(`https://bsky.app/profile/${this.profile.handle}/post/${id}`)
  }

  get dateCreated(): Date | undefined {
    if ('createdAt' in this.value) {
      const dateString = this.value.createdAt as string
      return new Date(Date.parse(dateString))
    }

    return undefined
  }

  formattedDate(locale: string): string | undefined {
    return this.dateCreated?.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
  }
}
