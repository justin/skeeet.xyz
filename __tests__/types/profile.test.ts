import { Profile } from '../../src/types/profile'

describe('Profile', () => {
  it('should create a valid profile', () => {
    const profileData = {
      id: '123',
      did: 'did:example:123',
      handle: 'john.doe',
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 30,
      bio: 'Lorem ipsum dolor sit amet',
      avatarUrl: 'https://example.com/avatar.jpg',
    }

    const profile = new Profile(profileData)
    expect(profile.profile.id).toBe('123')
    expect(profile.profile.name).toBe('John Doe')
    expect(profile.profile.email).toBe('john.doe@example.com')
    expect(profile.profile.age).toBe(30)
    expect(profile.profile.bio).toBe('Lorem ipsum dolor sit amet')
    expect(profile.profile.avatarUrl).toBe('https://example.com/avatar.jpg')
  })
})
