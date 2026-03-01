// Parse YYYY-MM-DD as local midnight (avoids UTC offset issues)
function parseLocalDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysLeft(expiration_date) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const exp = parseLocalDate(expiration_date)
  return Math.round((exp - now) / 86_400_000)
}

// red: 0-2 days (includes expired), yellow: 3-5, green: 6+
export function getUrgency(days) {
  if (days <= 2) return 'red'
  if (days <= 5) return 'yellow'
  return 'green'
}

export function formatExpiry(days) {
  if (days < 0)  return 'Vencido'
  if (days === 0) return 'Hoy'
  if (days === 1) return '1 día restante'
  return `${days} días restantes`
}
