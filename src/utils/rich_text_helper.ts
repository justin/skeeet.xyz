import * as BlueSky from '@atproto/api'
import { Post } from '../types/post'
import Handlebars from 'handlebars'
import { SafeString } from 'handlebars'

export function formattedPostText(post: Post): string {
  if (post.text) {
    let rt: BlueSky.RichText
    if (post.facets) {
      rt = new BlueSky.RichText({ text: post.text, facets: post.facets })
    } else if (post.entities) {
      rt = new BlueSky.RichText({ text: post.text, entities: post.entities })
    } else {
      rt = new BlueSky.RichText({ text: post.text })
    }

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
  }

  return new SafeString('').toString()
}
