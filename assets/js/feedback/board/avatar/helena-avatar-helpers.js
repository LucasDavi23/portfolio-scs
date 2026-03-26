// 🌷 Helena — Avatar Helpers
//
// Nível / Level: Aprendiz / Apprentice
//
// PT: Responsável pela lógica pura de avatar.
//     Faz parsing de nomes, normalização e geração de iniciais.
//
// EN: Responsible for pure avatar logic.
//     Handles name parsing, normalization and initials generation.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Helpers
/* -----------------------------------------------------------------------------*/

// PT: Extrai as iniciais de um nome ignorando números, símbolos e espaços.
//     Usa regex com suporte Unicode (\p{L}) para aceitar letras com acento.
//
// EN: Extracts initials from a name ignoring numbers, symbols and spaces.
//     Uses Unicode regex (\p{L}) to support accented letters.
function getInitials(name) {
  const words = (name || '').match(/\p{L}+/gu) || [];

  if (words.length === 0) return '';

  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  const firstLetter = words[0][0];
  const lastLetter = words[words.length - 1][0];

  return (firstLetter + lastLetter).toUpperCase();
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/

export const HelenaAvatarHelpers = {
  getInitials,
};
