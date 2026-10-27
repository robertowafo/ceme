// Validation d'entrée côté serveur. Les `maxLength` des formulaires ne protègent
// rien : n'importe quel client peut appeler l'API directement.

export class ValidationError extends Error {}

/** Texte : chaîne bornée. `required` rejette vide/absent ; sinon renvoie null si absent. */
export function str(value: unknown, field: string, max: number, required = false): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`Champ requis : ${field}`)
    return null
  }
  if (typeof value !== 'string') throw new ValidationError(`Champ invalide : ${field}`)
  const v = value.trim()
  if (!v) {
    if (required) throw new ValidationError(`Champ requis : ${field}`)
    return null
  }
  if (v.length > max) throw new ValidationError(`Champ trop long : ${field} (${max} caractères max)`)
  return v
}

export function reqStr(value: unknown, field: string, max: number): string {
  return str(value, field, max, true) as string
}

/** Valeur parmi une liste blanche (sinon `fallback`, ou erreur si pas de fallback). */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string, fallback?: T): T {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback
    throw new ValidationError(`Champ requis : ${field}`)
  }
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T
  throw new ValidationError(`Valeur non autorisée : ${field}`)
}

/** Nombre entier positif borné (montants). */
export function posInt(value: unknown, field: string, max: number): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n) || n <= 0 || n > max) throw new ValidationError(`Montant invalide : ${field}`)
  return n
}

/**
 * URL stockée puis rendue dans un href/src : uniquement http(s) ou un chemin
 * relatif (jamais javascript:, data:, etc.). Renvoie null si vide.
 */
export function url(value: unknown, field: string, required = false, max = 2048): string | null {
  const v = str(value, field, max, required)
  if (v === null) return null
  // Les navigateurs ignorent tabulations/retours à la ligne dans une URL : « java\tscript: »
  // serait exécuté. Aucun caractère de contrôle ni espace n'est donc toléré.
  if (/[\u0000-\u0020\u007f-\u009f\\]/.test(v)) throw new ValidationError(`URL non autorisée : ${field}`)
  // Liste blanche : http(s) absolu, ou chemin relatif à ce site ("/uploads/x.jpg").
  if (!/^https?:\/\/[^/]/i.test(v) && !/^\/(?![/\\])/.test(v)) throw new ValidationError(`URL non autorisée : ${field}`)
  return v
}

export function email(value: unknown, field: string, required = false): string | null {
  const v = str(value, field, 254, required)
  if (v === null) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new ValidationError(`Email invalide : ${field}`)
  return v.toLowerCase()
}

/** Vérifie l'en-tête binaire (octets magiques) d'un fichier annoncé comme ce type MIME. */
export function matchesMagicBytes(mime: string, head: Uint8Array): boolean {
  const eq = (offset: number, bytes: number[]) => bytes.every((b, i) => head[offset + i] === b)
  switch (mime) {
    case 'image/jpeg': return eq(0, [0xff, 0xd8, 0xff])
    case 'image/png': return eq(0, [0x89, 0x50, 0x4e, 0x47])
    case 'image/gif': return eq(0, [0x47, 0x49, 0x46, 0x38])
    case 'image/webp': return eq(0, [0x52, 0x49, 0x46, 0x46]) && eq(8, [0x57, 0x45, 0x42, 0x50])
    case 'application/pdf': return eq(0, [0x25, 0x50, 0x44, 0x46])
    case 'application/msword': return eq(0, [0xd0, 0xcf, 0x11, 0xe0])
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/epub+zip': return eq(0, [0x50, 0x4b, 0x03, 0x04])
    case 'video/mp4':
    case 'video/quicktime': return eq(4, [0x66, 0x74, 0x79, 0x70])
    case 'video/webm': return eq(0, [0x1a, 0x45, 0xdf, 0xa3])
    default: return false
  }
}
