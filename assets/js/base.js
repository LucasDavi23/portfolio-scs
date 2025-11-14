// JavaScript básico para o site
// ano do rodapé
document.getElementById('ano').textContent = new Date().getFullYear();

// botao volte para o topo
const backToTopBtn = document.getElementById('backToTopBtn');
const backToTop = () => {
  document.body.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
};
const scrollFunction = () => {
  backToTopBtn.style.display = window.scrollY > 20 ? 'block' : 'none';
};
window.addEventListener('scroll', scrollFunction);
backToTopBtn.addEventListener('click', backToTop);

// Mobile menu
const menuToggle = document.getElementById('menu-toggle');
const closeMenu = document.getElementById('close-menu');
const menu = document.getElementById('menu');
const backdrop = document.getElementById('menu-backdrop');

const open = () => {
  menu.classList.remove('hidden');
  backdrop.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
};
const close = () => {
  menu.classList.add('hidden');
  backdrop.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
};

menuToggle.addEventListener('click', open);
closeMenu.addEventListener('click', close);
backdrop.addEventListener('click', close);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') close();
});

// Fecha ao clicar em qualquer link do menu (e faz scroll suave)
document.querySelector('#menu').addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return; // clicou em algo que não é link
  const href = a.getAttribute('href');

  // fecha o menu primeiro
  close();

  // se for âncora interna (#alguma-coisa), evita navegação brusca e faz smooth scroll
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      // dá um pequeno tempo pro menu sumir antes de rolar
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }
});

// Carrossel

(function () {
  const root = document.getElementById('carrossel-producao');
  if (!root) return;

  const items = [...root.querySelectorAll('[id^="carrossel-item-"]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  const btnPrev = root.querySelector('#carrossel-prev');
  const btnNext = root.querySelector('#carrossel-next');

  const LAST = items.length - 1;
  let i = 0;
  let isAnimating = false;

  function setBtnState() {
    const mark = (btn, off) => {
      if (!btn) return;
      btn.setAttribute('aria-disabled', off ? 'true' : 'false');
      // continua capturando o clique (sem pointer-events-none)
      btn.classList.toggle('opacity-40', off);
      btn.classList.toggle('cursor-not-allowed', off);
    };
    mark(btnPrev, i === 0);
    mark(btnNext, i === LAST);
  }

  function paintDots(active) {
    dots.forEach((d, idx) => {
      d.setAttribute('aria-current', idx === active ? 'true' : 'false');
      d.classList.toggle('bg-white/90', idx === active);
      d.classList.toggle('bg-white/40', idx !== active);
      d.classList.add('ring-1', 'ring-black/10');
    });
  }

  // estado inicial (slide 0 visível, demais fora da tela à direita)
  function init() {
    items.forEach((el, idx) => {
      el.classList.remove('opacity-0', 'opacity-100', 'translate-x-5', '-translate-x-5');
      el.classList.add('absolute', 'inset-0', 'transition-transform', 'duration-500', 'ease-out');
      if (idx === 0) {
        el.classList.add('translate-x-0', 'z-10');
      } else {
        el.classList.add('translate-x-full', 'z-0', 'pointer-events-none');
      }
    });
    paintDots(0);
    setBtnState();
  }

  function show(target, dir = 1) {
    if (isAnimating) return;
    if (target < 0 || target > LAST) return; // 🔒 trava limites
    if (target === i) return;

    isAnimating = true;

    const currEl = items[i];
    const nextEl = items[target];

    // prepara o próximo do lado correto
    nextEl.classList.remove('translate-x-0', '-translate-x-full', 'pointer-events-none');
    nextEl.classList.add(dir > 0 ? 'translate-x-full' : '-translate-x-full', 'z-10');

    // força reflow
    // eslint-disable-next-line no-unused-expressions
    nextEl.offsetHeight;

    // anima: atual sai, próximo entra
    currEl.classList.remove('translate-x-0', 'z-10');
    currEl.classList.add(
      dir > 0 ? '-translate-x-full' : 'translate-x-full',
      'z-0',
      'pointer-events-none'
    );

    nextEl.classList.remove(dir > 0 ? 'translate-x-full' : '-translate-x-full');
    nextEl.classList.add('translate-x-0');

    const onDone = () => {
      nextEl.removeEventListener('transitionend', onDone);
      i = target;
      paintDots(i);
      setBtnState();
      isAnimating = false;
    };
    nextEl.addEventListener('transitionend', onDone, { once: true });
  }

  const next = () => show(i + 1, +1);
  const prev = () => show(i - 1, -1);

  // init
  init();

  // === Setas (interceptam clique mesmo desabilitadas) ===
  if (btnPrev)
    btnPrev.addEventListener('click', (e) => {
      if (btnPrev.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        e.stopPropagation();
        return; // bloqueia clique na imagem
      }
      prev();
    });

  if (btnNext)
    btnNext.addEventListener('click', (e) => {
      if (btnNext.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      next();
    });

  // dots
  dots.forEach((d, idx) =>
    d.addEventListener('click', () => {
      if (idx === i) return;
      show(idx, idx > i ? +1 : -1);
    })
  );

  // swipe (respeita limites)
  let sx = 0,
    sy = 0,
    t0 = 0;
  const MIN = 45,
    DOM = 1.25,
    FAST = 0.55;
  root.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      t0 = performance.now();
    },
    { passive: true }
  );

  root.addEventListener(
    'touchend',
    (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - sx,
        dy = t.clientY - sy;
      if (Math.abs(dy) * DOM > Math.abs(dx)) return;
      const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
      if (Math.abs(dx) < MIN && v < FAST) return;
      if (dx < 0) {
        if (i < LAST) next();
      } else {
        if (i > 0) prev();
      }
    },
    { passive: true }
  );
})();

// modal imagem
// modal imagem
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    const modal = document.getElementById('modalImg');
    const modalImg = document.getElementById('modalImgSrc');
    const btnClose = document.getElementById('modalClose');

    function openModal(src, altText = '') {
      console.log('[modal] openModal chamado com src =', src);

      if (!src) {
        console.warn('[modal] ❗ src vazio, não vou abrir a imagem.');
        return;
      }

      modalImg.src = src;
      modalImg.alt = altText;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden'; // evita rolagem do fundo
    }

    function closeModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
      modalImg.src = '';
      modalImg.alt = '';
    }

    // 🔥 Delegação global — funciona mesmo para cards criados depois
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('.js-open-modal');
      if (!opener) return;

      console.log('[modal] clique em opener:', opener);

      const img = opener.querySelector('img') || opener;

      console.log('[modal] img encontrada:', img);
      console.log('[modal] img.dataset.full =', img.dataset.full);
      console.log("[modal] img.getAttribute('data-full') =", img.getAttribute('data-full'));
      console.log('[modal] img.src =', img.src);

      const src = img.dataset.full || img.getAttribute('data-full') || img.src;

      const altText = img.alt || opener.getAttribute('aria-label') || '';

      console.log('[modal] src calculada =', src);

      openModal(src, altText);
    });

    btnClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(); // clique no backdrop fecha
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  });
})();

// card da imagem feedback
document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('foto-preview');
  if (!preview) return;

  // Força “tamanho de card”
  preview.classList.add(
    'w-full',
    'max-w-sm',
    'h-24',
    'overflow-hidden',
    'rounded-lg',
    'border',
    'border-gray-200',
    'bg-white',
    'shadow-sm'
  );

  // Função para padronizar qualquer <img> que entrar no preview
  const padronizarImgs = () => {
    preview.querySelectorAll('img').forEach((img) => {
      img.classList.add('w-full', 'h-full', 'object-cover', 'rounded-md');
      // limpa estilos inline que aumentem a imagem
      img.style.width = '';
      img.style.height = '';
      img.style.maxHeight = '';
      img.style.maxWidth = '';
      img.style.objectFit = '';
      img.decoding = 'async';
      img.loading = 'lazy';
    });
  };

  // já aplica se a UI tiver injetado algo
  padronizarImgs();

  // observa mudanças (quando seu UI.js troca a imagem)
  new MutationObserver(padronizarImgs).observe(preview, {
    childList: true,
    subtree: true,
  });
});
