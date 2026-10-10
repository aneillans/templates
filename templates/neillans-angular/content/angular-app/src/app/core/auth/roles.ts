/** Role names shared with the API's authorisation policies and the Keycloak realm. */
export const ROLES = {
  admin: 'admin',
  user: 'user',
} as const;

/** Reads the flat `roles` claim emitted by the realm-role mapper. */
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
