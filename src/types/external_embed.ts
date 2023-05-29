import * as BlueSky from '@atproto/api'

export class ExternalEmbed {
  uri: string
  title: string
  description: string
  thumb?: URL

  constructor(external: BlueSky.AppBskyEmbedExternal.ViewExternal)
  constructor(uri: string, title: string, description: string, thumb?: string)
  constructor(
    externalOrUri: BlueSky.AppBskyEmbedExternal.ViewExternal | string,
    title?: string,
    description?: string,
    thumb?: string
  ) {
    if (typeof externalOrUri === 'string') {
      this.uri = externalOrUri
      this.title = title || ''
      this.description = description || ''
      if (thumb) {
        this.thumb = new URL(thumb)
      }
    } else {
      this.uri = externalOrUri.uri
      this.title = externalOrUri.title
      this.description = externalOrUri.description
      if (externalOrUri.thumb) {
        this.thumb = new URL(externalOrUri.thumb)
      }
    }
  }

  toPayload(): { url: string; title: string; description: string; image?: string } {
    return {
      url: this.uri,
      title: this.title,
      description: this.description,
      image: this.thumb?.toString(),
    }
  }
}
