# 🧭 Layout — CSS Architecture

Este documento descreve a arquitetura do **CSS de Layout do sistema**.
Ele define **como a estrutura visual macro é organizada**, quais são
os responsáveis por cada camada e como o layout se adapta aos
diferentes dispositivos.

O Layout CSS **não estiliza componentes** nem features específicas.
Seu papel é estrutural: containers, grids, hierarquia espacial
e comportamento responsivo.

Em diversas partes do projeto, a estrutura de layout também é definida
diretamente no HTML por meio de **classes utilitárias do Tailwind.**

A camada de Layout CSS concentra-se na estrutura global e no
comportamento do layout em nível de sistema, enquanto as utilidades
do Tailwind são utilizadas para **composições locais dentro de seções
específicas da interface**.

---

## 🧭 1. Layout Global do Sistema (Atlas)

Responsável pela **estrutura macro do sistema**.

**Persona:** Atlas  
**Tipo:** Líder de Layout

Funções:

- Define containers principais
- Estabelece grids e limites estruturais
- Garante consistência espacial entre páginas e módulos
- Não aplica estilos visuais de UI nem tipografia

**Arquivo principal:**

`atlas-layout-leader.css`

---

## 🧱 2. Foundation (Base Estrutural)

**Tipo / Type:** Estrutural / Structural

Foundation define as **regras estruturais globais do sistema**.

Responsabilidades:

- Controle de viewport
- Comportamento base de scroll
- Regras estruturais globais
- Mecanismos como _global scroll lock_ usados por modais

Foundation atua como **base técnica do sistema**, sustentando
as demais camadas de layout.

**Arquivo principal:**

`foundation.css`

---

## 📱 3. Ajustes Responsivos

Camada responsável por **adaptar o layout a diferentes dispositivos**
sem recorrer a larguras fixas.

---

### 📱 Mobile — Ajustes de Modal

**Tipo / Type:** Estrutural / Structural

Arquivo técnico responsável por ajustes de layout e comportamento
de modais em telas pequenas.

Responsabilidades:

- Controle de altura
- Ajustes de scroll
- Refinamentos de espaçamento
- Melhor usabilidade em dispositivos móveis

**Arquivo:**

`modal-mobile.css`

---

### 💻 Notebook — Ajustes de Escala

**Tipo / Type:** Estrutural / Structural

Arquivo responsável por ajustes de escala visual para resoluções
intermediárias de notebooks.

Faixas tratadas:

- 1280–1440
- 1441–1600

Estratégias aplicadas:

- **zoom** como abordagem principal
- **scale** como fallback

Evita o uso de larguras fixas e preserva
proporções e legibilidade do layout.

**Arquivo:**

`notebook-scale.css`

---

## 🧠 Princípios Arquiteturais

- Layout define **estrutura**, não aparência
- Nenhum arquivo de layout estiliza componentes de UI
- Layout não redefine tipografia
- Responsividade evita _width fixo_
- Escalas são preferidas a quebras bruscas
- Layout global e layout local são camadas distintas

---

## 🔗 Relação com o Sistema

O Layout CSS atua em conjunto com:

- **Lexa** — Tipografia do sistema
- **Vega** — UI compartilhada
- **Morrigan** — Diretora geral do CSS

O Layout fornece a **estrutura espacial** sobre a qual essas camadas
operam, sem sobreposição de responsabilidades.

---

## ✅ Escopo

Este documento cobre exclusivamente a camada
de **Layout CSS** do sistema.

Outras camadas são documentadas separadamente:

- `system-css.md`
- `feedback-css.md`
