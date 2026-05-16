export function extractRoles(claims: Record<string, unknown>): string[] {
  const roleValue = claims['roles'];

  if (Array.isArray(roleValue)) {
    return roleValue.filter((value): value is string => typeof value === 'string');
  }

  if (typeof roleValue === 'string') {
    return [roleValue];
  }

  return [];
}
