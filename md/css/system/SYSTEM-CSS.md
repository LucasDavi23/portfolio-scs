# 🜃 Arquitetura Geral do Sistema — CSS

### Governança de Morrigan — Diretora Geral do CSS

Este documento apresenta o **mapa estrutural do CSS do sistema**.  
Ele descreve como os estilos globais, layouts e fundamentos visuais são
organizados, carregados e coordenados.

**Morrigan** supervisiona todo o CSS, garantindo ordem de carregamento,
isolamento de responsabilidades e consistência visual entre módulos.

---

## 🧭 Visão Geral dos Setores (CSS)

| Setor             | Líder / Diretora | Pasta Base                  | Papel Visual Resumido                |
| ----------------- | ---------------- | --------------------------- | ------------------------------------ |
| **System (Core)** | Morrigan 🜃       | `/system`                   | Entrada do CSS e coordenação global  |
| **Layout**        | Atlas 🧭         | `/system/layout`            | Estrutura macro, grids e containers  |
| **Tipografia**    | Lexa 🅰️          | `/system/typography`        | Linguagem tipográfica do sistema     |
| **UI Base**       | Vega ⭐          | `/system/ui`                | Componentes visuais reutilizáveis    |
| **Navigation UI** | Elo 🎨           | `/system/ui/navigation`     | Estado visual da navegação           |
| **Message UI**    | Veil 🌫️          | `/system/ui/message`        | Aparência visual da message box      |
| **Foundation**    | —                | `/system/foundation`        | Regras estruturais globais           |
| **Feedback**      | Seren / Nyla     | `/feedback`                 | Estilos locais do módulo de Feedback |
| **Responsivo**    | —                | `/system/layout/responsive` | Ajustes por dispositivo              |

---

# 🧩 Estrutura detalhada sob a supervisão de Morrigan

---

## 1) 🜃 Diretoria Geral do CSS (Morrigan)

/system/director  
└── **Morrigan 🜃**

Coordena o carregamento e a organização global do CSS.

---

## 2) 🧱 Foundation — Base Estrutural

/system/foundation

Regras estruturais globais:

- viewport
- scroll base
- scroll lock técnico
- regras estruturais compartilhadas

---

## 3) 🧭 Layout Global do Sistema (Atlas)

/system/layout  
└── **Atlas 🧭**

Responsável por:

- containers
- grids
- estrutura espacial

---

## 4) 🅰️ Tipografia do Sistema (Lexa)

/system/typography  
└── **Lexa 🅰️**

Define a linguagem tipográfica:

- fontes
- pesos
- hierarquia textual

---

## 5) ⭐ UI Base do Sistema (Vega)

/system/ui  
└── **Vega ⭐**

Responsável por padrões de interface:

- botões
- links
- estados de interação
- microcomponentes

---

## 6) 🎨 Navigation UI (Elo)

/system/ui/navigation  
└── **Elo 🎨**

Responsável por representar visualmente o **estado ativo da navegação**.

---

## 7) 🌫️ Message UI (Veil)

/system/ui/message  
└── **Veil 🌫️**

Responsável pela aparência visual da **Message Box** utilizada pelo sistema.

---

## 8) 📱 Camada Responsiva

/system/layout/responsive

Arquivos técnicos de adaptação por dispositivo.

---

## 🧠 Princípios Arquiteturais do CSS

- CSS é organizado por **domínio visual**
- Especialistas cuidam de partes específicas
- Leaders coordenam conjuntos
- Directors garantem ordem e entrada
- CSS não executa lógica nem estado

---

## 🔗 Relação com o JavaScript

| JS (Lógica)      | CSS (Visual)    |
| ---------------- | --------------- |
| Morgana          | Morrigan        |
| Leaders de setor | Leaders visuais |
| UI JS            | UI CSS          |
| Utils            | Foundation      |

---

## ⭐ Conclusão

O CSS do sistema não é um conjunto de estilos soltos,  
mas um **sistema visual governado**, com hierarquia clara
e ponto de entrada único.

**Morrigan garante ordem.  
O restante garante forma.**
