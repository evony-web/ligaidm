import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from './db';

const SESSION_SECRET = process.env.SESSION_SECRET || 'idm-league-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session token utilities using HMAC signing
export function createSessionToken(adminId: string, role: string): string {
  const payload = `${adminId}:${role}:${Date.now()}`;
  const signature = sign(payload);
  return `${payload}:${signature}`;
}

export function verifySessionToken(token: string): { adminId: string; role: string } | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 4) return null;
    const [adminId, role, timestamp, signature] = parts;
    const payload = `${adminId}:${role}:${timestamp}`;
    const expectedSignature = sign(payload);
    if (signature !== expectedSignature) return null;

    // Check token age (7 days max)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 7 * 24 * 60 * 60 * 1000) return null;

    return { adminId, role };
  } catch {
    return null;
  }
}

function sign(data: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('hex').slice(0, 32);
}

// Database operations
export async function getAdminByUsername(username: string) {
  return db.admin.findUnique({ where: { username } });
}

export async function getAdminById(id: string) {
  return db.admin.findUnique({ where: { id } });
}

export async function createAdmin(username: string, password: string, role: string = 'admin') {
  const passwordHash = await hashPassword(password);
  return db.admin.create({
    data: { username, passwordHash, role },
  });
}

export async function authenticateAdmin(username: string, password: string) {
  const admin = await getAdminByUsername(username);
  if (!admin) return null;

  const isValid = await verifyPassword(password, admin.passwordHash);
  if (!isValid) return null;

  return { id: admin.id, username: admin.username, role: admin.role };
}
