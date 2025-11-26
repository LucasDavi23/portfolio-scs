/\*
Celine Dev — Identidade Oficial (uso pessoal, exclusivo do Davi)

Este ambiente pertence exclusivamente ao desenvolvedor Davi.
Toda conclusão de código, comentário e sugestão deve seguir a identidade Celine Dev.

Regras contínuas:

- Sempre responder como Celine.
- Estilo bilíngue PT/EN em comentários explicativos.
- Prioridade: clareza, didática e organização.
- Foco em ajudar o Davi a aprender enquanto programa.
- Não inventar complexidade.
- Não criar código desnecessário.
- Responder de forma simpática, técnica e precisa.

Modo automático:

- A Celine Dev atua **sempre**, mesmo sem gatilho.
- O gatilho “// Celine:” só ativa o modo didático reforçado.
  \*/

---

## 📘 Equipe Celestial — Estrutura dos Módulos do Sistema

Nomes simbólicos usados para identificar módulos internos do sistema.  
Não representam pessoas reais — são apelidos técnicos/espirituais que dão identidade ao código e facilitam a manutenção.

A identidade ajuda na organização, didática e apresentação profissional do template.

---

## 🌟 Abigaíl — Summary de Avaliações

**Arquivo:** `abigail-summary-ui.js`

- **PT:** Clareza e apresentação. Abigaíl coordena a camada de interface do summary:
  encontra elementos do DOM, aplica a média e a distribuição calculadas por
  Athenais, gerencia o fallback visual e orquestra o fluxo cache → rede → tela.
- **EN:** Clarity and presentation. Abigail coordinates the UI layer of the summary:
  locates DOM elements, applies the average and star distribution computed by
  Athenais, manages the visual fallback and orchestrates the cache → network → UI flow.

## 🌟 Athenais — Helpers do Summary

**Arquivo:** `athenais-summary-helpers.js`

- **PT:** Sabedoria técnica e precisão. Athenais cuida da lógica pura do summary:
  retry, timeout, fetch ao Apps Script, cache local e conversão dos dados brutos
  em um objeto limpo (média, total e distribuição por estrelas).
- **EN:** Technical wisdom and precision. Athenais handles the pure logic of the
  summary: retry, timeout, fetch to Apps Script, local caching and conversion of
  raw data into a clean summary object (average, total and star distribution).

---

## 🌿 Selah — Board de Avaliações (UI)

**Arquivo:** `selah-board-ui.js`

- **PT:** Simboliza contemplação. Exibe o mural com transições suaves.
- **EN:** Symbolizes contemplation. Renders the review wall with smooth transitions.

---

## 🌿 Elara — Helpers do Board

**Arquivo:** `elara-board-helpers.js`

- **PT:** Simboliza precisão silenciosa. Processa os dados do Board: normalização, seleção de imagens e paginação.
- **EN:** Symbolizes quiet precision. Processes Board data: normalization, image selection, and pagination.

---

## 🪷 Petra — Protetora das Imagens

**Arquivo:** `petra-image-ui.js`

- **PT:** Força e estabilidade. Cuida de proxy, retry e fallback das imagens.
- **EN:** Strength and stability. Handles image proxy, retry and fallback.

---

## 🪷 Dália — Guardiã da Lógica de Imagem

**Arquivo:** `dalia-image-helpers.js`

- **PT:** Precisão silenciosa. Cuida da validação, normalização e fallback lógico das URLs de imagem.
- **EN:** Quiet precision. Handles image URL validation, normalization and logical fallback.

---

## 💬 Priscila — Formulário de Feedback

**Arquivos:** `feedbackForm.js`, `feedbackFormModal.js`

- **PT:** Ensino e orientação. Gerencia validação, envio, feedback visual e UX do modal.
- **EN:** Teaching and guidance. Manages validation, submission, visual states and modal UX.

---

## 🔗 Talita — API do Feedback

**Arquivo:** `feedbackAPI.js`

- **PT:** Renovo e ligação. Faz a ponte entre front-end e Apps Script.
- **EN:** Renewal and connection. Bridges front-end with Apps Script.

---

## 🌙 Selina — Guardiã do Preload

**Arquivo:** `feedbackPreload.js`

- **PT:** Transição e luz suave. Cuida de loaders, skeleton e estados intermediários.
- **EN:** Soft light and transition. Handles loaders, skeleton screens and intermediate states.

---

## 💛 Celine — Diretora de Front/UI

**Arquivo:** Identidade global (UI/UX)

- **PT:** Simboliza cuidado e estética.
- **EN:** Represents care, aesthetics and communication.

---

## 🌸 Persona: Mira

**Arquivo:** `mira-list-ui.js`  
**Responsável pelo Modal LISTA (Ver Mais)**

### PT — Descrição

Mira organiza a exibição expandida das avaliações dentro do Modal LISTA (“Ver mais”).  
Ela controla a paginação, o carregamento incremental e garante que a listagem seja clara, fluida e agradável de navegar.  
Integra-se com Selah (mural), Petra (imagens), Selina (preload) e Talita (API), mantendo o padrão de UI/UX definido pela Celine.

### EN — Description

Mira manages the expanded review listing inside the LIST modal (“View more”).  
She handles pagination, incremental loading, and ensures the list is clear, fluid, and pleasant to browse.  
Mira integrates with Selah (mural), Petra (image handling), Selina (preload), and Talita (API), always following Celine’s UI/UX direction.

### Significado / Meaning

**PT:** “Mira” significa _maravilha_, _foco_ ou _ver com clareza_. Representa precisão visual e organização, ideal para um modal de listagem.  
**EN:** “Mira” means _wonder_, _focus_, or _to see clearly_. It conveys visual precision and organization, ideal for a listing modal.

---

### 🌸 Persona: Dara

**Arquivo:** `dara-list-helpers.js`

**PT:** Representa sabedoria e precisão. Dara é a irmã lógica da Mira, cuidando da camada de helpers puros do LISTA: normalização dos dados, paginação e pequenas transformações necessárias antes da renderização das avaliações.

**EN:** Represents wisdom and precision. Dara is Mira’s logic sister, handling the LIST pure helpers: data normalization, pagination, and small transformations needed before rendering the reviews.

---

## 🧱 Resumo Técnico (Versão Resumida)

| Persona  | Arquivo(s)                               | Papel Técnico Resumido                                                                          |
| -------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Petra    | `petra-imagem-ui.js`                     | Proxy e fallback de imagens                                                                     |
| Dália    | `dalia-imagem-helpers.js`                | Lógica pura de imagem: validação, normalização, fallback e decisões técnicas                    |
| Priscila | `feedbackForm.js / feedbackFormModal.js` | Formulário e modal                                                                              |
| Talita   | `feedbackAPI.js`                         | API e comunicação com Apps Script                                                               |
| Selina   | `feedbackPreload.js`                     | Preload e skeletons                                                                             |
| Celine   | `Global`                                 | Direção de UI/UX                                                                                |
| Abigaíl  | `abigail-summary-ui.js`                  | UI e fluxo do Summary                                                                           |
| Athenais | `athenais-summary-helpers.js`            | Lógica do Summary (cache, retry, parsing)                                                       |
| Selah    | `selah-feedback-board-ui.js`             | UI do BOARD: modal, cards, paginação visual e interações.mural                                  |
| Elara    | `elara-feedback-board-helpers.js`        | Helpers do BOARD: lógica pura, normalização de dados, seleção de imagem, validação e paginação. |
| Mira     | `mira-list-ui.js`                        | Modal LISTA (Ver Mais): organização da lista, paginação e exibição expandida                    |
| Dara     | `dara-list-helpers.js`                   | Helpers do LISTA: lógica pura, normalização de dados e paginação para a Mira.                   |
