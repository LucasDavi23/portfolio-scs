## 🧱 Arquitetura do Layout

| Persona   | Pasta / Escopo Alvo             | Arquivo(s)                   | Papel Técnico Resumido                                                    |
| --------- | ------------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| Luna 🌙   | layout/foundation/              | `luna-foundation.js`         | Foundation: ano do rodapé, botão voltar ao topo, base do layout.          |
| Navi 🧭   | layout/nav/submenu/             | `navi-submenu-layout.js`     | Controle do submenu/menu mobile, backdrop e smooth scroll interno.        |
| Aura 🌬️   | layout/effects/scroll/          | `aura-scroll-effects.js`     | Efeitos visuais baseados em scroll; ponto de expansão para melhorias.     |
| Iris 👁️   | layout/modal/                   | `iris-image-viewer.js`       | Modal global de imagem, centralização, escurecimento e navegação segura.  |
| Nami 🎠   | layout/hero/carousel/           | `nami-carousel-layout.js`    | Lógica principal do carrossel: estados, transições, swipe e navegação.    |
| Yume 🌌   | layout/hero/carousel/animation/ | `yume-carousel-animation.js` | Animações customizadas do carrossel (futuro), separação de lógica/visual. |
| Aurora 🌇 | layout/leader/                  | `aurora-layout-main.js`      | Líder do Layout: inicializa e coordena todas as meninas do layout.        |
