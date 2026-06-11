export const ADMIN_EMAIL = 'impacttech237@gmail.com';

export function isUserAdmin(email: string | null | undefined): boolean {
  return email === ADMIN_EMAIL;
}

// Retourne les headers Authorization pour les appels API protégés
export function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('session_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Appel API authentifié (JSON)
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers as Record<string, string> || {})
    }
  });
}
