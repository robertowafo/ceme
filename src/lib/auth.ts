// La session admin vit dans un cookie HttpOnly posé par l'API — le navigateur
// l'attache automatiquement à chaque requête same-origin, sans intervention du
// JavaScript (donc invisible et non exfiltrable via une éventuelle faille XSS).
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    }
  });
}
