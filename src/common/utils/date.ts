export function formatDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}

export function isOlderThan18(dob: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  return m < 0 || (m === 0 && today.getDate() < dob.getDate())
    ? age - 1 >= 18
    : age >= 18;
}

export function isAtLeast18YearsAfter(dob: Date, joinedAt: Date): boolean {
  const ageAtJoinedDate = joinedAt.getFullYear() - dob.getFullYear();
  const monthDiff = joinedAt.getMonth() - dob.getMonth();
  const dayDiff = joinedAt.getDate() - dob.getDate();

  if (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)) {
    return ageAtJoinedDate >= 18;
  }

  return ageAtJoinedDate > 18;
}
