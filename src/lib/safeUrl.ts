/**
 * Dernier rempart côté affichage : une URL venant de la base (document, partenaire…)
 * n'est jamais placée dans un href/src sans vérification. Seuls http(s) et les chemins
 * relatifs au site passent ; « javascript: », « data: », « vbscript: » (y compris
 * déguisés par des tabulations ou majuscules) sont remplacés par `fallback`.
 */
const FORBIDDEN_CHARS = /[\u0000- \u007f-\u009f\\]/;

export function safeUrl(value: string | null | undefined, fallback = '#'): string {
  const v = (value ?? '').trim();
  if (!v || FORBIDDEN_CHARS.test(v)) return fallback;
  if (/^https?:\/\/[^/]/i.test(v) || /^\/(?![/\\])/.test(v)) return v;
  return fallback;
}
