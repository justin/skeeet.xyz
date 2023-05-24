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
   * The profile data.
   */
  public profile: ProfileView

  /**
   * Creates a new profile instance.
   * @param v - The profile data.
   * @throws If the profile data is invalid.
   */
  constructor(v: ProfileView) {
    const validation = BlueSky.AppBskyActorDefs.validateProfileViewBasic(v)
    if (validation.success) {
      this.profile = v
    } else {
      console.error(`Invalid ProfileView: ${validation.error}`)
      throw validation.error
    }
  }

  /**
   * The decentralized identifier for the user.
   */
  get did(): string {
    return this.profile.did
  }

  /**
   * The username/handle for the user ("jww.wtf")
   */
  get handle(): string {
    return this.profile.handle
  }

  /**
   * The display name for the user ("Justin Williams")
   */
  get displayName(): string {
    return this.profile.displayName ?? ''
  }

  /**
   * The URL for retrieving the profile avatar.
   */
  get avatar(): string | undefined {
    return this.profile.avatar
  }
}
