export const STATE_TZ: Record<string, string> = {
  NSW: 'Australia/Sydney',
  ACT: 'Australia/Sydney',
  VIC: 'Australia/Melbourne',
  TAS: 'Australia/Hobart',
  QLD: 'Australia/Brisbane',
  SA: 'Australia/Adelaide',
  WA: 'Australia/Perth',
  NT: 'Australia/Darwin',
}
 
export function getStateTimezone(state?: string | null): string {
  const key = state?.trim().toUpperCase()
  return (key && STATE_TZ[key]) || 'Australia/Sydney'
}

function getPartsInTimezone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
  }
}

export function getDateStringInState(date: Date, state?: string | null): string {
  const { year, month, day } = getPartsInTimezone(date, getStateTimezone(state))
  return `${year}-${month}-${day}`
}

export function formatDatetimeLocalInState(date: Date, state?: string | null): string {
  const { year, month, day, hour, minute } = getPartsInTimezone(date, getStateTimezone(state))
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export function datetimeLocalInStateToISO(localStr: string, state?: string | null): string {
  const tz = getStateTimezone(state)
  const provisional = new Date(localStr + 'Z')

  const dtf = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const [auH, auM] = dtf.format(provisional).split(':').map(Number)

  const [, timePart] = localStr.split('T')
  const [wantH, wantM] = timePart.split(':').map(Number)
  let diffMinutes = wantH * 60 + wantM - (auH * 60 + auM)

  if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60
  if (diffMinutes < -12 * 60) diffMinutes += 24 * 60

  return new Date(provisional.getTime() + diffMinutes * 60_000).toISOString()
}

export function isTodayInState(localStr: string, state?: string | null): boolean {
  const [datePart] = localStr.split('T')
  if (!datePart) return false
  return datePart === getDateStringInState(new Date(), state)
}

export function snapTodayToStateNow(
  localStr: string,
  state?: string | null,
  leadMinutes = 60
): string {
  const tz = getStateTimezone(state)
  const today = getDateStringInState(new Date(), state)
  const earliest = formatDatetimeLocalInState(
    new Date(Date.now() + leadMinutes * 60_000),
    state
  )
  const [, timePart] = earliest.split('T')
  return `${today}T${timePart}`
}


export function applyStateScheduleChange(
  value: string,
  state?: string | null,
  leadMinutes = 0
): string {
  if (!value) return ''
  if (isTodayInState(value, state)) {
    const minAllowed = getMinScheduledDatetimeLocal(state, leadMinutes)
    if (value < minAllowed) {
      return minAllowed
    }
  }
  return value
}

export function getMinScheduledDatetimeLocal(state?: string | null, leadMinutes = 60): string {
  return formatDatetimeLocalInState(new Date(Date.now() + leadMinutes * 60_000), state)
}

export function getMaxScheduledDatetimeLocal(state?: string | null, daysAhead = 30): string {
  return formatDatetimeLocalInState(
    new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    state
  )
}

export function getStateTimeLabel(state?: string | null): string {
  const key = state?.trim().toUpperCase()
  if (key && STATE_TZ[key]) return `${key} time`
  return 'Australian Eastern time'
}
