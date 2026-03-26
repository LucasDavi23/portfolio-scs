/* -----------------------------------------------------------------------------*/
// ✨ Dara — List Helpers
//
// Nível / Level: Jovem / Young
//
// PT: Centraliza a lógica pura do modal de lista, sem DOM.
//     Fornece nomes de plataforma, links externos e validações simples.
//
// EN: Centralizes the pure logic for the list modal, without DOM.
//     Provides platform labels, external links and simple validations.
/* -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------*/
// Platform Links
//
// PT: Mapa base de links por plataforma.
// EN: Base link map by platform.
/* -----------------------------------------------------------------------------*/
const PLATFORM_LINKS = {
  shopee: 'https://shopee.com.br/shop/433324481',
  ml: 'https://www.mercadolivre.com.br/pagina/scsomercioemgeral?item_id=MLB3387412425&category_id=MLB1634&seller_id=282445432&client=recoview-selleritems&recos_listing=true#origin=pdp&component=sellerData&typeSeller=eshop',
  google: 'https://share.google/hIDbxPQ5A2jAxFOjb',
};

/* -----------------------------------------------------------------------------*/
// Platform Helpers
//
// PT: Helpers para nome e link de plataforma.
// EN: Helpers for platform label and link.
/* -----------------------------------------------------------------------------*/
function getPlatformLabel(platform) {
  switch (platform) {
    case 'shopee':
      return 'Shopee';
    case 'ml':
      return 'Mercado Livre';
    case 'google':
      return 'Google';
    default:
      return 'SCS';
  }
}

function getPlatformLink(platform) {
  return PLATFORM_LINKS[platform] || null;
}

/* -----------------------------------------------------------------------------*/
// URL Validation
//
// PT: Verifica se a URL pode entrar no pipeline de imagem.
// EN: Checks whether the URL can enter the image pipeline.
/* -----------------------------------------------------------------------------*/
function isUsableUrl(url = '') {
  const source = String(url).trim();
  if (!source) return false;

  // PT: Bloqueia placeholders comuns de formulário.
  // EN: Blocks common form placeholder URLs.
  if (source === 'https://.../' || source.includes('://...')) return false;

  // PT: Data URLs já são válidas para imagem.
  // EN: Data URLs are already valid for images.
  if (source.startsWith('data:image/')) return true;

  // PT: Aceita rotas locais do app, como /gas-img...
  // EN: Accepts local app routes, such as /gas-img...
  if (source.startsWith('/')) return true;

  try {
    new URL(source);
    return true;
  } catch {
    return false;
  }
}

/* -----------------------------------------------------------------------------*/
// Error Helpers
//
// PT: Verifica se o erro parece ser de timeout.
// EN: Checks whether the error looks like a timeout.
/* -----------------------------------------------------------------------------*/
function isTimeoutError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return message.includes('timeout') || message.includes('tempo esgotado');
}

/* -----------------------------------------------------------------------------*/
// Export
/* -----------------------------------------------------------------------------*/
export const DaraListHelpers = {
  getPlatformLabel,
  getPlatformLink,
  isUsableUrl,
  isTimeoutError,
};
