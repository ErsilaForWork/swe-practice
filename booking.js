// Times are integer minutes on one day; bookings contain valid intervals.
function hasOverlap(start, end, bookings) {
  for (const booking of bookings) {
    if (start < booking.end && end > booking.start) return true;
  }
  return false;
}

function canBook({ start, end, now, blocked, bookings }) {
  if (blocked) return false;
  if (!Number.isInteger(start) || !Number.isInteger(end) ||
      start < 0 || start >= end || end > 1440 || start <= now) return false;
  if (end - start > 120) return false;
  return !hasOverlap(start, end, bookings);
}

// Decision layer over canBook. Preserves the legacy UI reason precedence
// available -> blocked -> overlap -> generic, including the quirk that the
// overlap message wins even when duration/bounds/past checks also fail.
function explainBooking({ start, end, now, blocked, bookings }) {
  if (canBook({ start, end, now, blocked, bookings })) {
    return { available: true, reasonCode: 'available' };
  }
  if (blocked) return { available: false, reasonCode: 'blocked' };
  // Keeps the loose comparisons of the legacy UI check (no integer validation
  // here) so existing messages and precedence are unchanged.
  if (hasOverlap(start, end, bookings)) {
    return { available: false, reasonCode: 'overlap' };
  }
  return { available: false, reasonCode: 'invalid' };
}

if (typeof module !== 'undefined') module.exports = { canBook, explainBooking, hasOverlap };
