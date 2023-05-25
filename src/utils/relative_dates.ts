const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = WEEK * 4
const YEAR = DAY * 365
export function formattedRelativeDate(date: Date): string {
  const timeInMilliseconds = date.getTime()

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.floor((Date.now() - timeInMilliseconds) / 1000)

  if (deltaSeconds < MINUTE) {
    return `${deltaSeconds}s`
  } else if (deltaSeconds < HOUR) {
    return `${Math.floor(deltaSeconds / MINUTE)}m`
  } else if (deltaSeconds < DAY) {
    return `${Math.floor(deltaSeconds / HOUR)}h`
  } else if (deltaSeconds < WEEK) {
    return `${Math.floor(deltaSeconds / DAY)}d`
  } else if (deltaSeconds < MONTH) {
    return `${Math.floor(deltaSeconds / WEEK)}w`
  } else if (deltaSeconds < YEAR) {
    return `${Math.floor(deltaSeconds / MONTH)}mo`
  } else {
    return `${Math.floor(deltaSeconds / YEAR)}y`
  }
}
