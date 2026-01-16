# 🧭 Layout — CSS Architecture

Este documento descreve a arquitetura do **CSS de Layout do sistema**.
Ele define **como a estrutura visual macro é organizada**, quais são
os responsáveis por cada camada e como o layout se adapta aos
diferentes dispositivos.

O Layout CSS **não estiliza componentes** nem features específicas.
Seu papel é estrutural: containers, grids, hierarquia espacial
e comportamento responsivo.

---

## 🧭 1. Layout Global do Sistema (Atlas)

Responsável pela **estrutura macro do sistema**.

- Define containers principais
- Estabelece grids e limites estruturais
- Garante consistência espacial entre páginas e módulos
- Não aplica estilos visuais de UI nem tipografia

### 🧭 Liderança

- **Atlas** — Líder de Layout do Sistema

**Arquivo principal:**

- `atlas-layout-leader.css`

---

## 🧱 2. Foundation (Base Estrutural)

Responsável pelas **regras estruturais globais** que sustentam o layout.

- Controle de viewport
- Comportamento base de scroll
- Mecanismos como _global scroll lock_ (usado por modais)
- Regras que servem de fundação para todo o sistema

**Arquivo principal:**

- `foundation.css`

Foundation atua **abaixo** do layout, como base técnica,
e não define hierarquia visual ou grids.

---

## 📱 3. Ajustes Responsivos

Camada responsável por **adaptar o layout a diferentes dispositivos**
sem recorrer a larguras fixas.

### 📱 Mobile

- Ajustes específicos para modais em telas pequenas
- Controle de altura, scroll e espaçamento
- Refinamentos de usabilidade mobile

**Arquivo:**

- `modal-mobile.css`

### 💻 Notebook

- Ajustes de escala visual para resoluções intermediárias
- Faixas 1280–1440 e 1441–1600
- Uso de _zoom_ como estratégia principal
- _Scale_ como fallback
- Preservação de proporções e legibilidade

**Arquivo:**

- `notebook-scale.css`

---

## 🧭 4. Layouts Locais (Astra)

Responsável por **layouts específicos de seções**,
sem interferir na estrutura global.

- Organiza hero, conteúdo e blocos internos
- Aplica princípios definidos por Atlas
- Atua em escopos locais (ex.: Feedback)

### 🧭 Liderança Local

- **Astra** — Layout do Feedback

**Arquivo principal:**

- `astra-feedback-layout.css`

Outras seções podem futuramente possuir seus próprios layouts locais,
sempre respeitando as diretrizes globais do sistema.

---

## 🧠 Princípios Arquiteturais

- Layout define **estrutura**, não aparência
- Nenhum arquivo de layout estiliza componentes de UI
- Nenhum layout redefine tipografia
- Responsividade evita _width fixo_
- Escalas são preferidas a quebras bruscas
- Layout global e layout local são camadas distintas

---

## 🔗 Relação com o Sistema

O Layout CSS atua em conjunto com:

- **Lexa** — Tipografia do sistema
- **Vega** — UI compartilhada
- **Coretta** — Orquestração de imports do System
- **Morrigan** — Diretora geral do CSS

O Layout fornece a **estrutura** sobre a qual essas camadas operam,
sem sobreposição de responsabilidades.

---

## ✅ Escopo

Este documento cobre **exclusivamente o CSS de Layout**.
Outras camadas do sistema são documentadas separadamente:

- `SYSTEM-CSS.md`
- `FEEDBACK-CSS.md`
