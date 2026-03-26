// 🧩 UUID — Unique ID Utility
//
// Nível / Level: Jovem / Young
//
// PT: Gera identificadores únicos com fallback seguro.
// EN: Generates unique identifiers with safe fallback.

/* -----------------------------------------------------------------------------*/
// UUID Generation
//
// PT: Gera UUID com suporte moderno e fallbacks.
// EN: Generates UUID with modern support and fallbacks.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

// PT: Retorna um identificador único.
// EN: Returns a unique identifier.
export function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (_) {}

  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);

      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;

      const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');

      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  } catch (_) {}

  return `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
