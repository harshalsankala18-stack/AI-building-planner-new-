export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
}

export interface AuthSession {
  readonly token: string;
  readonly user: AuthUser;
}

const AUTH_STORAGE_KEY = 'argon_auth_session';

type AuthListener = (session: AuthSession | null) => void;
const listeners = new Set<AuthListener>();

export const authService = {
  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.token === 'string' && parsed.user) {
        return parsed as AuthSession;
      }
      return null;
    } catch {
      return null;
    }
  },

  getUser(): AuthUser | null {
    return this.getSession()?.user ?? null;
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },

  setSession(session: AuthSession | null): void {
    if (session) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    listeners.forEach((fn) => fn(session));
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async login(credentials: { email: string; password?: string }): Promise<AuthSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error?.message || 'Invalid email or password';
      throw new Error(msg);
    }

    const data = (await res.json()) as AuthSession;
    this.setSession(data);
    return data;
  },

  async loginWithDemo(): Promise<AuthSession> {
    return this.login({
      email: 'demo@argon4.studio',
      password: 'ArgonDemo#2026',
    });
  },

  async logout(): Promise<void> {
    const session = this.getSession();
    if (session?.token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
        });
      } catch {
        // silent
      }
    }
    this.setSession(null);
  },

  async verifySession(): Promise<boolean> {
    const session = this.getSession();
    if (!session) return false;
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      if (!res.ok) {
        this.setSession(null);
        return false;
      }
      const data = await res.json();
      if (data?.user) {
        this.setSession({ token: session.token, user: data.user });
        return true;
      }
      return false;
    } catch {
      // In offline mode, trust local stored session
      return true;
    }
  },
};
