import { cookies } from 'next/headers';

export interface AuthSession {
  userId: string;
  email: string;
  role: string;
  name: string;
  managedDeptId?: string | null;
  departmentName?: string | null;
}

const COOKIE_NAME = 'lbc_ris_session';

export async function setAuthSession(session: AuthSession) {
  const cookieStore = cookies();
  const sessionString = Buffer.from(JSON.stringify(session)).toString('base64');
  cookieStore.set(COOKIE_NAME, sessionString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    const jsonString = Buffer.from(sessionCookie.value, 'base64').toString('utf8');
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}