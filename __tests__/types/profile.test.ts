import { describe, it, expect } from 'vitest'
import { Profile } from '../../src/types/profile'

describe('Profile', () => {
  it('should create a valid profile from a ProfileView type', () => {
    const profileData = {
      id: '123',
      did: 'did:example:123',
      handle: 'john.doe',
      displayName: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      description: 'Lorem ipsum dolor sit amet',
      avatar: 'https://example.com/avatar.jpg',
    }

    const profile = new Profile(profileData)
    expect(profile.did).toBe('did:example:123')
    expect(profile.displayName).toBe('John Doe')
    expect(profile.handle).toBe('john.doe')
    expect(profile.bio).toBe('Lorem ipsum dolor sit amet')
    expect(profile.avatar).toBe('https://example.com/avatar.jpg')
  })

  it('should create a valid profile from injected values', () => {
    const profile = new Profile(
      'did:example:123',
      'john.doe',
      'John Doe',
      'https://example.com/avatar.jpg',
      'Lorem ipsum dolor sit amet'
    )
    expect(profile.did).toBe('did:example:123')
    expect(profile.displayName).toBe('John Doe')
    expect(profile.handle).toBe('john.doe')
    expect(profile.bio).toBe('Lorem ipsum dolor sit amet')
    expect(profile.avatar).toBe('https://example.com/avatar.jpg')
  })
})
