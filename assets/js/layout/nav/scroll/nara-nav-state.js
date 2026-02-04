// ---------------------------------------------------------------------
// 🧭 Nara — Navigation State Specialist (Adulta)
//
// PT: Detecta a seção ativa via scroll (IntersectionObserver)
//     e mantém o estado do menu sincronizado.
// EN: Tracks active sections via scroll and
//     syncs navigation state.
//
// Contract:
//  - Links: <a class="nav-link" data-nav="producao" href="#producao">
//  - Sections: <section id="producao">...</section>
//
// Visual:
//  - Apenas aplica classe (ex: is-active)
//  - Visual é responsabilidade da Elo (CSS)
// ---------------------------------------------------------------------

// ------------------------------
// Internal state (module-level)
// ------------------------------
let links = [];
let sections = []; // PT: aqui são os alvos observados (sentinelas)
// EN: observed targets (sentinels)
let sectionIds = [];
let lastActiveId = null;
let isEnabled = false;

// PT: Armazenamos handlers para remover corretamente no disable.
// EN: Store handlers for proper cleanup.
let onHashChange = null;
const clickHandlers = new Map();

let rafId = 0;

// ------------------------------
// Config (system-level)
// ------------------------------
const CONFIG = {
  activeClass: 'is-active',
  linkSelector: 'a.nav-link[data-nav]',
};

// ------------------------------
// DOM helpers (Nara-specific)
// ------------------------------
function getHashId() {
  const raw = String(location.hash || '');
  return raw.startsWith('#') ? raw.slice(1) : raw;
}

function setActive(id) {
  if (!id) return;

  // PT: Limpa estado anterior
  // EN: Clear previous state
  for (const a of links) a.classList.remove(CONFIG.activeClass);

  // PT: Marca somente o link cujo data-nav = id
  // EN: Mark only the link whose data-nav = id
  for (const a of links) {
    if (a.dataset.nav === id) a.classList.add(CONFIG.activeClass);
  }
}

// ------------------------------
// DOM collection (bind targets)
// ------------------------------
function collectDom() {
  // PT: Pega links desktop + mobile (ambos têm .nav-link e data-nav)
  // EN: Collect both desktop and mobile links
  links = Array.from(document.querySelectorAll(CONFIG.linkSelector));
  if (!links.length) return false;

  // PT: IDs únicos (data-nav) preservando ordem de aparição
  // EN: Unique ids (data-nav), preserving appearance order
  sectionIds = Array.from(new Set(links.map((a) => String(a.dataset.nav || '').trim()))).filter(
    Boolean
  );

  // PT: Targets reais no DOM (normalmente sentinelas)
  // EN: Real DOM targets (usually sentinels)
  sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  return sections.length > 0;
}

// ------------------------------
// Initial state
// ------------------------------
function applyInitialState() {
  const hashId = getHashId();

  // PT: Se o hash existe e está no contrato, respeita.
  // EN: If hash exists and matches contract, respect it.
  if (hashId && sections.some((s) => s.id === hashId)) {
    lastActiveId = hashId;
  } else {
    // PT: Caso contrário, começa no primeiro target da lista.
    // EN: Otherwise, start at the first target.
    lastActiveId = sections[0].id;
  }

  setActive(lastActiveId);
}

// ------------------------------
// Scroll-spy (sentinels + scrollY)
// ------------------------------
function getHeaderOffset() {
  // PT: Sua nav fixa tem h-16 => 64px
  // EN: Fixed nav height is 64px
  return 64;
}

function getProbeY() {
  // PT: Ponto de leitura (estável). Ajusta a sensação de "quando troca".
  // EN: Probe point (stable). Adjusts the "when to switch" feeling.
  return window.scrollY + getHeaderOffset() + window.innerHeight * 0.35;
}

function computeActiveBySentinels() {
  const y = getProbeY();

  // PT: Escolhe a sentinela "mais recente" que já passou do probeY.
  // EN: Pick the latest sentinel that has passed the probeY.
  let bestId = null;
  let bestTop = -Infinity;

  for (const el of sections) {
    const top = el.offsetTop;

    if (top <= y && top > bestTop) {
      bestTop = top;
      bestId = el.id;
    }
  }

  // PT: Antes de qualquer sentinela, usa a primeira.
  // EN: Before any sentinel, use the first one.
  if (!bestId && sections.length) bestId = sections[0].id;

  if (bestId && bestId !== lastActiveId) {
    lastActiveId = bestId;
    setActive(bestId);
  }
}

function onScrollSpy() {
  // PT: rAF para performance (1 cálculo por frame)
  // EN: rAF for performance (1 compute per frame)
  if (rafId) return;

  rafId = requestAnimationFrame(() => {
    rafId = 0;
    computeActiveBySentinels();
  });
}

function bindScrollSpy() {
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  window.addEventListener('resize', onScrollSpy, { passive: true });

  // PT/EN: Estado inicial baseado na rolagem atual.
  computeActiveBySentinels();
}

function unbindScrollSpy() {
  window.removeEventListener('scroll', onScrollSpy);
  window.removeEventListener('resize', onScrollSpy);

  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
}

// ------------------------------
// Click + hash sync
// ------------------------------
function bindClicks() {
  // PT: evita duplicatas
  // EN: prevent duplicates
  clickHandlers.clear();

  for (const a of links) {
    const handler = () => {
      const id = String(a.dataset.nav || '').trim();
      if (!id) return;

      // PT: Atualiza imediatamente no clique (feedback visual rápido)
      // EN: Update immediately on click (fast visual feedback)
      lastActiveId = id;
      setActive(id);

      // PT: Garante sincronização após scroll/anchor suave
      // EN: Ensure sync after smooth anchor scrolling
      requestAnimationFrame(() => computeActiveBySentinels());
      setTimeout(() => computeActiveBySentinels(), 180);
    };

    clickHandlers.set(a, handler);
    a.addEventListener('click', handler, { passive: true });
  }
}

function bindHashChange() {
  onHashChange = () => {
    const id = getHashId();
    if (!id) return;
    if (!sectionIds.includes(id)) return;

    lastActiveId = id;
    setActive(id);

    requestAnimationFrame(() => computeActiveBySentinels());
  };

  window.addEventListener('hashchange', onHashChange);
}

// ------------------------------
// Public API (project standard)
// ------------------------------
function enableNavState() {
  // PT: Idempotente (evita listeners duplicados)
  // EN: Idempotent (prevents duplicate listeners)
  if (isEnabled) return;

  const ok = collectDom();
  if (!ok) return;

  isEnabled = true;

  applyInitialState();
  bindClicks();
  bindScrollSpy();
  bindHashChange();
}

function disableNavState() {
  if (!isEnabled) return;
  isEnabled = false;

  if (onHashChange) {
    window.removeEventListener('hashchange', onHashChange);
    onHashChange = null;
  }

  unbindScrollSpy();

  for (const [a, handler] of clickHandlers.entries()) {
    a.removeEventListener('click', handler);
    a.classList.remove(CONFIG.activeClass);
  }
  clickHandlers.clear();

  links = [];
  sections = [];
  sectionIds = [];
  lastActiveId = null;
}

// ------------------------------
// Export pattern (system standard)
// ------------------------------
export const NaraNavState = {
  enableNavState,
  disableNavState,
};
