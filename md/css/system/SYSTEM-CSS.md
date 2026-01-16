# 🜃 Arquitetura Geral do Sistema — CSS

### Governança de Morrigan — Diretora Geral do CSS

Este documento apresenta o **mapa estrutural completo do CSS do sistema**.  
Ele descreve como os estilos globais, layouts e fundamentos visuais são
organizados, carregados e coordenados.

**Morrigan** supervisiona todo o CSS, garantindo ordem de carregamento,
isolamento de responsabilidades e consistência visual entre módulos.

---

## 🧭 Visão Geral dos Setores (CSS)

| Setor             | Líder / Diretora     | Pasta Base           | Papel Visual Resumido                                         |
| ----------------- | -------------------- | -------------------- | ------------------------------------------------------------- |
| **System (Core)** | Morrigan 🜃           | `/system`            | Entrada do CSS, ordem de imports e coordenação visual global. |
| **Layout**        | Atlas 🧭             | `/system/layout`     | Estrutura macro, containers, grids e limites do sistema.      |
| **Tipografia**    | Lexa 🅰️              | `/system/typography` | Linguagem tipográfica base e hierarquia textual.              |
| **UI Base**       | Vega ⭐              | `/system/ui`         | Componentes visuais reutilizáveis e estados de interação.     |
| **Foundation**    | —                    | `/system/foundation` | Regras estruturais globais (scroll, viewport, base).          |
| **Feedback**      | Astra / Seren / Nyla | `/feedback`          | Estilos locais do módulo de Feedback (documentado à parte).   |
| **Responsivo**    | —                    | `/layout/responsive` | Ajustes técnicos por faixa de dispositivo.                    |

---

# 🧩 Estrutura detalhada sob a supervisão de Morrigan

---

## 1) 🜃 Diretoria Geral do CSS (Morrigan)

/system/director  
└── **Morrigan 🜃** — Diretora Geral do CSS

**Papel:**

- Atua como **ponto de entrada do CSS**
- Centraliza e ordena o carregamento dos líderes visuais
- Não define estilos, layout ou UI
- Garante previsibilidade, modularidade e escalabilidade

Morrigan é **coordenação pura**, equivalente visual da Morgana (JS).

---

## 2) 🧱 Foundation — Base Estrutural

/system/foundation  
└── **Foundation** — regras estruturais globais

**Responsabilidades:**

- Controle de viewport
- Comportamento base de scroll
- Global scroll lock (modais)
- Regras técnicas compartilhadas por todo o sistema

Foundation sustenta todas as demais camadas.

---

## 3) 🧭 Layout Global do Sistema (Atlas)

/system/layout  
└── **Atlas 🧭** — Líder de Layout do Sistema

**Responsabilidades:**

- Containers principais
- Grids e limites estruturais
- Consistência espacial entre páginas e módulos

Atlas **não estiliza componentes**, apenas estrutura.

---

## 4) 🅰️ Tipografia do Sistema (Lexa)

/system/typography  
└── **Lexa 🅰️** — Tipografia do Sistema

**Responsabilidades:**

- Fontes base
- Hierarquia textual
- Pesos e line-height
- Linguagem visual tipográfica unificada

Lexa define **linguagem**, não layout nem UI.

---

## 5) ⭐ UI Base do Sistema (Vega)

/system/ui  
└── **Vega ⭐** — UI do Sistema

**Responsabilidades:**

- Botões e links
- Estados de interação (hover, focus, disabled)
- Microcomponentes reutilizáveis
- Padrões de UI compartilhados

Vega opera **acima da tipografia** e **abaixo das features**.

---

## 6) 📱 Camada Responsiva (Técnica)

/layout/responsive

- **modal-mobile.css** — ajustes específicos para mobile
- **notebook-scale.css** — ajustes de escala para notebooks

**Características:**

- Sem width fixo
- Preferência por _zoom_
- _scale_ como fallback
- Preservação de proporções e legibilidade

---

## 🧠 Princípios Arquiteturais do CSS

- CSS é organizado por **domínio visual**
- Especialistas cuidam de partes específicas
- Leaders coordenam conjuntos
- Directors garantem ordem e entrada do sistema
- Nenhum arquivo mistura responsabilidades
- CSS não executa lógica nem estado

---

## 🔗 Relação com o JavaScript

O CSS espelha conceitualmente o JS, sem duplicar funções:

| JS (Lógica)      | CSS (Visual)         |
| ---------------- | -------------------- |
| Morgana          | Morrigan             |
| Leaders de setor | Leaders visuais      |
| UI JS            | UI CSS (Vega)        |
| Utils puros      | Foundation / ajustes |

Ambos evoluem de forma **independente**, porém **coordenada**.

---

## ✅ Escopo

Este documento cobre **exclusivamente o CSS do sistema**.  
Outras camadas são documentadas separadamente:

- `LAYOUT-CSS.md`
- `FEEDBACK-CSS.md`

---

## ⭐ Conclusão

O CSS do sistema não é um conjunto de estilos soltos,  
mas um **sistema visual governado**, com hierarquia clara,
papéis definidos e ponto de entrada único.

**Morrigan garante ordem.  
O restante garante forma.**
