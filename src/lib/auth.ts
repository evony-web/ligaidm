import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SECRET_KEY = process.env.IDM_SECRET_KEY || 'idm-league-secret-key-2025';
const COOKIE_NAME = 'idm-admin-session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(username: string, role: string): string {
  const payload = JSON.stringify({ username, role, ts: Date.now() });
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
  return Buffer.from(`${payload}.${signature}`).toString('base64');
}

export function verifySessionToken(token: string): { username: string; role: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [payload, signature] = decoded.split('.');
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex');
    if (signature !== expectedSig) return null;
    const data = JSON.parse(payload);
    // Token valid for 24 hours
    if (Date.now() - data.ts > 24 * 60 * 60 * 1000) return null;
    return { username: data.username, role: data.role };
  } catch {
    return null;
  }
}

export function getSessionFromCookies(cookieHeader: string | null): { username: string; role: string } | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
