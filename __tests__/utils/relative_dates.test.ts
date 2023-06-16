import { formattedRelativeDate } from '../../src/utils/relative_dates'

describe('formattedRelativeTime', () => {
  const now = new Date()

  it('should return "1s" for a time 1 second ago', () => {
    const time = new Date(now.getTime() - 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('1s')
  })

  it('should return "2m" for a time 2 minutes ago', () => {
    const time = new Date(now.getTime() - 2 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('2m')
  })

  it('should return "1h" for a time 1 hour ago', () => {
    const time = new Date(now.getTime() - 60 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('1h')
  })

  it('should return "2d" for a time 2 days ago', () => {
    const time = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('2d')
  })

  it('should return "1w" for a time 1 week ago', () => {
    const time = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('1w')
  })

  it('should return "1mo" for a time 1 month ago', () => {
    const time = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('1mo')
  })

  it('should return "1y" for a time 1 year ago', () => {
    const time = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    const formattedTime = formattedRelativeDate(time)
    expect(formattedTime).toBe('1y')
  })
})
