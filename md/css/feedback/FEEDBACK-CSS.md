# 🎯 Feedback — CSS Architecture

Este documento descreve a arquitetura do **CSS do módulo de Feedback**.
Aqui não estão os estilos em si, mas **como eles se organizam**, **quem faz o quê**
e **como as camadas se relacionam**.

O módulo de Feedback é composto por duas camadas principais:

1. Board (exibição das avaliações)
2. Formulário (envio de feedback)

---

A estrutura de layout da seção de Feedback é gerenciada
principalmente por meio de utilitários do Tailwind no HTML.
A camada CSS concentra-se em responsabilidades visuais específicas,
como cards, avatares, rating e estilização do formulário.

## 🧩 1. Board de Avaliações (Seren)

Responsável pela **exibição das avaliações prontas**.
O board não lida com entrada de dados, apenas com leitura e visualização.

### 🌿 Liderança

- **Seren** — coordena ritmo, espaçamento e organização geral do board

### 🎴 Estrutura

- **Aline** — estrutura visual dos cards (containers, bordas, fundos e sombras)

### 👤 Identidade e Conteúdo

- **Tessa** — imagem do feedback
- **Zara** — apresentação visual do rating (estrelas)
- **Marka** — badges e selos de origem/contexto

### 🧩 Variantes

- **Compact** — modo denso do board, reduzindo espaçamentos
  e a densidade de layout dos cards
  (decisão estrutural sob liderança da Seren)

---

## 📝 2. Formulário de Feedback (Nyla)

Responsável pela **interface visual de envio do feedback**.

### 🌾 Liderança

- **Nyla** — coordena a estrutura visual do módulo de formulário
  e centraliza a importação das especialistas

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

- `layout-css.md`
- `system-css.md`
