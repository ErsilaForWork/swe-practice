// Times are integer minutes on one day; bookings contain valid intervals.
function canBook({ start, end, now, blocked, bookings }) {
  if (blocked) return false;
  if (!Number.isInteger(start) || !Number.isInteger(end) ||
      start < 0 || start >= end || end > 1440 || start <= now) return false;
  if (end - start > 120) return false;
  for (const booking of bookings) {
    if (start < booking.end && end > booking.start) return false;
  }
  return true;
}
if (typeof module !== 'undefined') module.exports = { canBook };
