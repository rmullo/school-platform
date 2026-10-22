import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { publicUserSchema, type PublicUser } from '@smartschool/contracts';
import { z } from 'zod';

let accessToken: string | null = null;
let refreshing: Promise<PublicUser | null> | null = null;
let onExpired = () => {};
const sessionSchema = z.object({ accessToken: z.string(), user: publicUserSchema });
async function renew(): Promise<PublicUser | null> {
  if (refreshing) return refreshing;
  const exchange = async () => {
    const response = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'x-smartschool-client': 'web' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) { if (response.status === 401) { accessToken = null; onExpired(); return null; } throw new Error('Não foi possível recuperar a sessão. Tente novamente.'); }
    const result = sessionSchema.parse(await response.json()); accessToken = result.accessToken; return result.user;
  };
  refreshing = (async () => navigator.locks ? await navigator.locks.request('smartschool-refresh', exchange) : await exchange())().finally(() => { refreshing = null; });
  return refreshing;
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const send = () => fetch('/api/v1/' + path, { ...options, credentials: 'same-origin', signal: options.signal ?? AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json', 'x-smartschool-client': 'web', ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}), ...options.headers } });
  let response = await send();
  if (response.status === 401 && !['auth/login', 'auth/refresh'].includes(path)) { if (await renew()) response = await send(); }
  if (!response.ok) {
    if (response.status === 401) { accessToken = null; onExpired(); }
    const problem = await response.json().catch(() => ({})) as { detail?: string };
    throw new Error(problem.detail ?? 'Não foi possível concluir. Tente novamente.');
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}
type Session = { user: PublicUser | null; loading: boolean; error: string; retry(): void; login(email: string, password: string): Promise<void>; logout(): Promise<void> };
const Context = createContext<Session | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const retry = () => { setLoading(true); setError(''); void renew().then(setUser).catch(() => setError('Não foi possível conectar. Confira o ambiente e tente novamente.')).finally(() => setLoading(false)); };
  useEffect(() => { onExpired = () => setUser(null); retry(); return () => { onExpired = () => {}; }; }, []);
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => { void api<PublicUser>('auth/me').then(setUser).catch(() => {}); }, 30000);
    return () => clearInterval(timer);
  }, [user?.id]);
  return <Context.Provider value={{ user, loading, error, retry,
    async login(email, password) { const result = sessionSchema.parse(await api('auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })); accessToken = result.accessToken; setUser(result.user); },
    async logout() { await api('auth/logout', { method: 'POST' }); accessToken = null; setUser(null); },
  }}>{children}</Context.Provider>;
}
export function useSession() { const context = useContext(Context); if (!context) throw new Error('SessionProvider necessário'); return context; }
