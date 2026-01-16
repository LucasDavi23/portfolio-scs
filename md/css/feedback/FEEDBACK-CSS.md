# 🎯 Feedback — CSS Architecture

Este documento descreve a arquitetura do **CSS do módulo de Feedback**.
Aqui não estão os estilos em si, mas **como eles se organizam**, **quem faz o quê**
e **como as camadas se relacionam**.

O módulo de Feedback é composto por três camadas principais:

1. Layout da seção
2. Board (exibição das avaliações)
3. Formulário (envio de feedback)

---

## 🧭 1. Layout do Feedback (Astra)

Responsável pela **estrutura da seção de feedback** dentro da página.

- Organiza a disposição do hero, board e formulário
- Aplica princípios de layout definidos globalmente por Atlas
- Atua apenas no escopo local do feedback

**Arquivos principais:**

- `astra-feedback-layout.css`

---

## 🧩 2. Board de Avaliações (Seren)

Responsável pela **exibição das avaliações prontas**.
O board não lida com entrada de dados, apenas com leitura e visualização.

### 🌿 Liderança

- **Seren** — coordena ritmo, espaçamento e organização geral do board

### 🎴 Estrutura

- **Aline** — estrutura visual dos cards (containers, sombras, variantes)

### 👤 Identidade e Conteúdo

- **Nina** — avatar e identidade do autor
- **Sofia** — texto do feedback
- **Tessa** — imagem do feedback
- **Zara** — exibição do rating (estrelas)
- **Marka** — badges e selos de origem/contexto

### 🔧 Utilidades Locais

- **Nora** — helpers e ajustes visuais específicos do board

### 🧩 Variantes

- **Compact** — modo denso do board, reduzindo espaçamentos e altura dos cards  
  (decisão estrutural sob liderança da Seren)

---

## 📝 3. Formulário de Feedback (Nyla)

Responsável pela **interface visual de envio do feedback**.

### 🌾 Liderança

- **Nyla** — coordena o módulo do formulário e seus imports

### 📝 Interface

- **Elisa** — campos, labels, mensagens de erro e estados visuais

O formulário trata apenas de **apresentação visual**.
Validação, envio e lógica pertencem ao JavaScript.

---

## 🧠 Princípios Arquiteturais

- CSS é organizado por **domínio visual**, não por tecnologia
- Especialistas cuidam de partes específicas
- Leaders coordenam conjuntos
- Variantes são decisões estruturais, não personas
- Nenhum arquivo de Feedback CSS define regras globais do sistema

---

## 🔗 Relações com o Sistema

- **Atlas** define o layout global
- **Lexa** define a tipografia base
- **Vega** define UI compartilhada
- **Foundation** sustenta regras estruturais
- **Morrigan** atua como ponto de entrada do CSS do sistema

O Feedback utiliza essas bases, mas não as redefine.

---

## ✅ Escopo

Este documento cobre **exclusivamente o CSS do módulo de Feedback**.
Outros aspectos do sistema são documentados em seus respectivos arquivos:

- `LAYOUT-CSS.md`
- `SYSTEM-CSS.md`
