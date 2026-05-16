import { extractRoles } from './role-utils';

describe('extractRoles', () => {
  it('returns role array when roles claim is an array', () => {
    expect(extractRoles({ roles: ['admin', 'user'] })).toEqual(['admin', 'user']);
  });

  it('returns empty list for missing roles claim', () => {
    expect(extractRoles({})).toEqual([]);
  });
});
