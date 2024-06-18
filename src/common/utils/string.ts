export function formatFirstName(firstName: string) {
  const nameParts = firstName.toLowerCase().trim().split(' ');
  const firstNamePart = nameParts[0];

  let otherNameParts = '';

  if (nameParts.length > 1) {
    otherNameParts = nameParts
      .slice(1)
      .map((part) => part.charAt(0))
      .join('');
  }
  return firstNamePart + otherNameParts;
}
