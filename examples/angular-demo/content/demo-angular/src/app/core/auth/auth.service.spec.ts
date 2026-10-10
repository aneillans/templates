import { isSafeReturnPath } from './auth.service';

describe('isSafeReturnPath', () => {
  it('accepts app paths', () => {
    expect(isSafeReturnPath('/')).toBe(true);
    expect(isSafeReturnPath('/admin?tab=1#top')).toBe(true);
  });

  it('rejects anything that could leave the app', () => {
    for (const path of [null, undefined, '', 'https://evil.example', '//evil.example', '/\\evil']) {
      expect(isSafeReturnPath(path)).toBe(false);
    }
  });
});
