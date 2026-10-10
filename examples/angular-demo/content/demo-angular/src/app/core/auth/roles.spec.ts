import { extractRoles } from './roles';

describe('extractRoles', () => {
  it('returns role array when roles claim is an array', () => {
    expect(extractRoles({ roles: ['admin', 'user'] })).toEqual(['admin', 'user']);
  });

  it('wraps a single string role', () => {
    expect(extractRoles({ roles: 'admin' })).toEqual(['admin']);
  });

  it('drops non-string entries', () => {
    expect(extractRoles({ roles: ['admin', 42, null] })).toEqual(['admin']);
  });

  it('returns empty list for missing roles claim', () => {
    expect(extractRoles({})).toEqual([]);
  });
});
