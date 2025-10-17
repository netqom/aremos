/**
 * Authenticated user object attached to requests by auth-hardening plugin
 */
export interface AuthUser {
  id: number;
  tokenVersion: number;
}

/**
 * Extended request with authenticated user
 */
export interface AuthenticatedRequest {
  authUser: AuthUser;
}

