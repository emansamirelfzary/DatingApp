/**
 * Minimal, dependency-free JWT helpers.
 *
 * The API stores role claims inside the signed JWT, so the client can derive
 * the current user's roles directly from the token without exposing roles in
 * the `UserDTO`. This keeps the client in sync with the server authorization
 * policies (e.g. `RequireAdminRole`).
 */

export type JwtPayload = {
  [claim: string]: unknown;
};

// ASP.NET Core can emit the role claim using either the full WS-Fed URI
// (default) or the short "role" name depending on claim type mapping.
const ROLE_CLAIM_TYPES = [
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'role',
];

/** Decode the payload (middle segment) of a JWT. Returns null when invalid. */
export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) {
    return null;
  }

  try {
    const segment = token.split('.')[1];
    if (!segment) {
      return null;
    }

    // JWT uses base64url; convert to standard base64 before decoding.
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

/** Extract the list of roles contained in a JWT. Empty array when none/invalid. */
export function getRolesFromToken(token: string | null | undefined): string[] {
  const payload = decodeJwt(token);
  if (!payload) {
    return [];
  }

  for (const claimType of ROLE_CLAIM_TYPES) {
    const value = payload[claimType];
    if (Array.isArray(value)) {
      return value.filter((role): role is string => typeof role === 'string');
    }
    if (typeof value === 'string') {
      return [value];
    }
  }

  return [];
}
