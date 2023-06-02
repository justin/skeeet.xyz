import * as BlueSky from '@atproto/api'
import { Post } from '../types/post'
import Handlebars from 'handlebars'
import { SafeString } from 'handlebars'

export function formattedPostText(post: Post): string {
  if ('text' in post.record) {
    if ('facets' in post.record) {
      post.facets = post.record.facets as BlueSky.AppBskyRichtextFacet.Main[]
      const rt = new BlueSky.RichText({ text: post.record.text as string, facets: post.facets })

      const pieces: string[] = []
      for (const segment of rt.segments()) {
        if (segment.isLink()) {
          pieces.push(`<a href="${segment.link?.uri}">${segment.text}</a>`)
        } else if (segment.isMention()) {
          pieces.push(`<span class="mention-username">${segment.text}</span>`)
        } else {
          const runs = segment.text.split('\n')
          for (let i = 0; i < runs.length; i++) {
            if (i > 0) {
              pieces.push('<br />')
            }

            if (runs[i].length > 0) {
              pieces.push(`${runs[i]}`)
            }
          }
        }
      }

      return new Handlebars.SafeString(pieces.join('')).toHTML()
    } else {
      return new Handlebars.SafeString(post.record.text as string).toHTML()
    }
  }

  return new SafeString('').toString()
}
