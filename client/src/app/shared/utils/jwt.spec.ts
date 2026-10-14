import { decodeJwt, getRolesFromToken } from './jwt';

function makeToken(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'HS512', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('jwt utils', () => {
  it('decodes the payload of a JWT', () => {
    const payload = decodeJwt(makeToken({ sub: 'user-1', name: 'Alex' }));
    expect(payload).toEqual({ sub: 'user-1', name: 'Alex' });
  });

  it('returns null for invalid tokens', () => {
    expect(decodeJwt(null)).toBeNull();
    expect(decodeJwt('not-a-jwt')).toBeNull();
  });

  it('extracts a single role claim', () => {
    const token = makeToken({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
    });
    expect(getRolesFromToken(token)).toEqual(['Admin']);
  });

  it('extracts an array of role claims', () => {
    const token = makeToken({
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': [
        'Admin',
        'Moderator',
      ],
    });
    expect(getRolesFromToken(token)).toEqual(['Admin', 'Moderator']);
  });

  it('returns an empty array when there are no roles', () => {
    expect(getRolesFromToken(makeToken({ sub: 'user-1' }))).toEqual([]);
    expect(getRolesFromToken(null)).toEqual([]);
  });
});
