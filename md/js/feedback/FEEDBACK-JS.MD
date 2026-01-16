## 🧱 Arquitetura do Board (Visualização dos Feedbacks)

| Persona     | Pasta / Escopo Alvo      | Arquivo(s)                        | Papel Técnico Resumido                                                              |
| ----------- | ------------------------ | --------------------------------- | ----------------------------------------------------------------------------------- |
| Nádia 🧬    | feedback/board/api/rede/ | `nadia-api-core-helpers.js`       | Core da API: fetch com timeout, retry, cache, coalesce e controle de tráfego.       |
| Naomi 🍃    | feedback/board/api/card/ | `naomi-card-api-helpers.js`       | FeedbackCardAPI: monta URLs, chama o ApiCore (Nádia) e normaliza dados em cards.    |
| Abigaíl 🌟  | feedback/board/summary/  | `abigail-summary-ui.js`           | UI do Summary: renderização, fallback e fluxo geral da tela de resumo.              |
| Athenais 🌟 | feedback/board/summary/  | `athenais-summary-helpers.js`     | Lógica do Summary: caching, retry, timeout, parsing e fetch ao GAS.                 |
| Selah 🌿    | feedback/board/main/     | `selah-feedback-board-ui.js`      | UI do Board: modal, interação, animações e fluxo visual dos cards.                  |
| Elara 🌿    | feedback/board/main/     | `elara-feedback-board-helpers.js` | Helpers do Board: normalização de dados, paginação, seleção de imagem e validações. |
| Lia 🌱      | feedback/board/main/     | `lia-board-preload-helpers.js`    | Pré-aquecimento da API: mantém endpoints ativos e prepara dados para a Selah.       |
| Petra 🪷     | feedback/board/image/    | `petra-imagem-ui.js`              | UI de imagens: proxy, fallback visual, estados de carregamento.                     |
| Dália 🪷     | feedback/board/image/    | `dalia-imagem-helpers.js`         | Lógica pura de imagem: normalização de URLs, validação e fallback técnico.          |
| Mira 🌸     | feedback/board/list/     | `mira-list-ui.js`                 | UI da LISTA (Ver Mais): estrutura do modal, paginação visual e exibição expandida.  |
| Dara 🌸     | feedback/board/list/     | `dara-list-helpers.js`            | Lógica do LISTA: normalização de dados, paginação e helpers para Mira.              |
| Helena 🌷   | feedback/board/avatar/   | `helena-avatar-helpers.js`        | Helpers do Avatar: lógica de nomes, normalização e geração de iniciais.             |
| Lívia 🌷    | feedback/board/avatar/   | `livia-avatar-ui.js`              | UI do Avatar: aplicação visual das iniciais e integração com os cards.              |
