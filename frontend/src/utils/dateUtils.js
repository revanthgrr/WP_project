/**
 * Returns the current date as a YYYY-MM-DD string in the local timezone.
 */
export function getLocalISODate(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

/**
 * Returns the current month as a YYYY-MM string in the local timezone.
 */
export function getLocalISOMonth(date = new Date()) {
  return getLocalISODate(date).slice(0, 7);
}
