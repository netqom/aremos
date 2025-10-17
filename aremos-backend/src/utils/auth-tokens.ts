import * as JWT from 'jsonwebtoken';
import { randomUUID } from 'crypto';

export type TokenPayload = { id: number; name: string; tokenVersion: number };

export function signAccessToken(user: { id: number; name: string; tokenVersion: number }) {
  const jti = randomUUID();
  const payload: TokenPayload = { id: user.id, name: user.name, tokenVersion: user.tokenVersion ?? 0 };
  const token = JWT.sign(payload, process.env.APP_JWT_SECRET as string, { expiresIn: '2h', jwtid: jti });
  return token;
}
