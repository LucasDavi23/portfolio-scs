### 🧭 Navi — Submenu & Mobile Navigation

**Arquivo:** `navi-submenu-layout.js`

**PT:**  
Navi controla toda a navegação móvel e o submenu principal.  
Ela é responsável por abrir, fechar e bloquear o scroll do corpo da página quando o menu está visível.  
Também gerencia o backdrop (área escura), o botão de fechar e o comportamento de links internos com scroll suave.

Funções que Navi fornece:

- Abrir o menu mobile
- Fechar o menu mobile
- Trancar/destrancar o scroll de fundo
- Detectar clique em links internos e aplicar smooth scroll
- Fechar o menu quando o usuário toca fora da área do nav

Navi não faz animações avançadas — seu foco é **controle de navegação** e experiência fluida em dispositivos móveis.

**EN:**  
Navi controls the entire mobile navigation and main submenu.  
She is responsible for opening/closing the mobile menu and locking page scroll while the menu is active.  
She also manages the backdrop, the close button, and smooth scrolling for internal anchor links.

Navi provides:

- Mobile menu open handler
- Mobile menu close handler
- Body scroll lock/unlock
- Internal anchor smooth scrolling
- Closing the menu when clicking outside the nav area

Navi does not handle advanced animations — her focus is **navigation control** and a smooth mobile experience.
