import * as BlueSky from '@atproto/api'

/**
 * Represents a detailed view of a user profile.
 */
type ProfileView =
  | BlueSky.AppBskyActorDefs.ProfileViewDetailed
  | BlueSky.AppBskyActorDefs.ProfileViewBasic
  | BlueSky.AppBskyActorDefs.ProfileView

/**
 * Represents a user profile.
 */
export class Profile {
  /**
   * The decentralized identifier for the user.
   */
  did: string
  /**
   * The username/handle for the user ("jww.wtf")
   */
  handle: string

  /**
   * The display name for the user ("Justin Williams")
   */
  displayName: string

  /**
   * The URL for retrieving the profile avatar.
   */
  avatar?: string

  /**
   * The user's bio/description.
   */
  bio?: string

  /**
   * The URL for the user's profile.
   */
  url: URL
  /**
   * Creates a new profile instance.
   * @param v - The profile data.
   * @throws If the profile data is invalid.
   */
  constructor(v: ProfileView)
  constructor(did: string, handle: string, displayName: string, avatar?: string, bio?: string)
  constructor(
    externalOrUri: ProfileView | string,
    handle?: string,
    displayName?: string,
    avatar?: string,
    bio?: string
  ) {
    if (typeof externalOrUri === 'string') {
      this.did = externalOrUri
      this.handle = handle || ''
      this.displayName = displayName || ''
      this.avatar = avatar
      this.bio = bio
    } else {
      const validation = BlueSky.AppBskyActorDefs.validateProfileViewBasic(externalOrUri)
      if (validation.success) {
        this.did = externalOrUri.did
        this.handle = externalOrUri.handle
        this.displayName = externalOrUri.displayName ?? ''
        this.avatar = externalOrUri.avatar
        this.bio = (externalOrUri.description as string) ?? ''
      } else {
        console.error(`Invalid ProfileView: ${validation.error}`)
        throw validation.error
      }
    }

    this.url = new URL(`https://bsky.app/profile/${this.handle}`)
  }
}
