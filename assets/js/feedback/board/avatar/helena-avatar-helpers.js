// /assets/js/feedback/board/avatar/helena-avatar-helpers.js
// 🌷 Helena — Helpers do Avatar
// PT: Lógica pura do avatar: tratamento de nomes, normalização e geração das iniciais.
// EN: Pure avatar logic: name parsing, normalization and initials generation.
/* -----------------------------------------------------------------------------*/

// Pega iniciais ignorando símbolos, números e espaços
export function getInitials(name) {
  // pega apenas sequências de letras (suporta acentos com \p{L})
  const words = (name || '').match(/\p{L}+/gu) || [];
  if (words.length === 0) return '';
  if (words.length === 1) return words[0][0].toUpperCase();
  const first = words[0][0];
  const last = words[words.length - 1][0];
  return (first + last).toUpperCase();
}

export const HelenaAvatarHelpers = {
  getInitials,
};
