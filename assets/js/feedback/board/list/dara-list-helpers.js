// /assets/js/feedback/Mira_Dara/feedback-list-helpers.js
// ✨ Dara — Assistente lógica da Mira (Helpers)
// PT: Centraliza a lógica "pura" do modal LISTA (sem DOM):
//     - Mapa de links por plataforma
//     - Nome legível da plataforma
//     - Detecção de erro de timeout
//
// EN: Centralizes the "pure" logic for the LIST modal (no DOM):
//     - Platform link map
//     - Human readable platform name
//     - Timeout error detection
//
// Regras / Rules:
//  - Nada de document/querySelector aqui.
//  - Somente funções puras, fáceis de testar e reutilizar.
//------------------------------------------------------------

// ==========================
// 1) CONFIG (PLATAFORMAS)
// ==========================
// PT: Mapa base de links por plataforma.
// EN: Base map of links by platform.
const PLATFORM_LINKS = {
  shopee: 'https://shopee.com.br/shop/433324481',
  ml: 'https://www.mercadolivre.com.br/pagina/scsomercioemgeral?item_id=MLB3387412425&category_id=MLB1634&seller_id=282445432&client=recoview-selleritems&recos_listing=true#origin=pdp&component=sellerData&typeSeller=eshop',
  google: 'https://share.google/hIDbxPQ5A2jAxFOjb',
};

// ==========================
// 2) HELPERS DE PLATAFORMA
// ==========================

/**
 * PT: Retorna o nome "bonito" da plataforma.
 * EN: Returns the human–readable name for the platform.
 */
export function getPlatformLabel(plat) {
  // platform = 'shopee' | 'ml' | 'google'
  switch (plat) {
    case 'shopee':
      return 'Shopee';
    case 'ml':
      return 'Mercado Livre';
    case 'google':
      return 'Google';
    default:
      return 'Avaliações do site (SCS)';
  }
}

/**
 * PT: Retorna o link base da plataforma (ou null se não houver).
 * EN: Returns the base link for the platform (or null if none).
 */
export function getPlatformLink(plat) {
  // platform = 'shopee' | 'ml' | 'google'
  return PLATFORM_LINKS[plat] || null;
}

// ============================================================
// 🟣 Validação de foto (usada pela Mira)
// ============================================================
export function hasRealPhoto(url) {
  // Verifica se a URL da foto é "real" (não genérica)
  if (!url) return false; // vazio ou nulo
  if (typeof url !== 'string') return false; // não é string

  const safeUrl = url.trim().toLowerCase(); // segura e minúscula

  if (!safeUrl) return false; // string vazia
  if (safeUrl === 'null') return false; // string "null"
  if (safeUrl === 'undefined') return false; // string "undefined"
  if (safeUrl === '#') return false;

  return true; // parece uma URL válida
}

// ==========================
// 3) HELPERS DE ERRO
// ==========================

/**
 * PT: Verifica se o erro parece ser de timeout.
 * EN: Checks if the error seems to be a timeout error.
 */

export function isTimeoutError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  return msg.includes('timeout') || msg.includes('tempo esgotado');
}
