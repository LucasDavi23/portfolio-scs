# 🜃 System Architecture — CSS

### Governance by Morrigan — CSS Director

This document presents the **structural map of the system’s CSS**.  
It describes how global styles, layouts and visual foundations are
organized, loaded and coordinated.

**Morrigan** oversees the entire CSS architecture, ensuring correct loading order, responsibility isolation and visual consistency across modules.

---

## 🧭 CSS Sectors Overview

| Sector            | Leader / Director | Base Folder                 | Visual Role Summary                     |
| ----------------- | ----------------- | --------------------------- | --------------------------------------- |
| **System (Core)** | Morrigan 🜃        | `/system`                   | CSS entry point and global coordination |
| **Layout**        | Atlas 🧭          | `/system/layout`            | Macro structure, grids and containers   |
| **Typography**    | Lexa 🅰️           | `/system/typography`        | System typographic language             |
| **UI Base**       | Vega ⭐           | `/system/ui`                | Reusable visual components              |
| **Navigation UI** | Elo 🎨            | `/system/ui/navigation`     | Visual navigation state                 |
| **Message UI**    | Veil 🌫️           | `/system/ui/message`        | Message box visual appearance           |
| **Foundation**    | —                 | `/system/foundation`        | Global structural rules                 |
| **Feedback**      | Seren / Nyla      | `/feedback`                 | Local styles for the Feedback module    |
| **Responsive**    | —                 | `/system/layout/responsive` | Device-specific adjustments             |

---

# 🧩 Detailed Structure under Morrigan’s Supervision

---

## 1) 🜃 CSS Global Direction (Morrigan)

/system/director  
└── **Morrigan 🜃**

Coordinates the loading and global organization of CSS.

---

## 2) 🧱 Foundation — Structural Base

/system/foundation

Global structural rules:

- viewport
- base scroll behavior
- technical scroll lock
- shared structural rules

---

## 3) 🧭 Global System Layout (Atlas)

/system/layout  
└── **Atlas 🧭**

Responsible for:

- containers
- grids
- spatial structure

---

## 4) 🅰️ System Typography (Lexa)

/system/typography  
└── **Lexa 🅰️**

Defines the typographic language:

- fonts
- weights
- text hierarchy

---

## 5) ⭐ System UI Base (Vega)

/system/ui  
└── **Vega ⭐**

Responsible for interface patterns:

- buttons
- links
- interaction states
- micro components

---

## 6) 🎨 Navigation UI (Elo)

/system/ui/navigation  
└── **Elo 🎨**

Responsible for visually representing the **active navigation state**.

---

## 7) 🌫️ Message UI (Veil)

/system/ui/message  
└── **Veil 🌫️**

Responsible for the visual appearance of the system’s **Message Box**.

---

## 8) 📱 Responsive Layer

/system/layout/responsive

Technical files responsible for device adaptation.

---

## 🧠 CSS Architectural Principles

- CSS is organized by **visual domain**
- Specialists handle specific parts of the interface
- Leaders coordinate visual groups
- Directors ensure order and entry points
- CSS does not execute logic or manage state

---

## 🔗 Relationship with JavaScript

| JS (Logic)     | CSS (Visual)   |
| -------------- | -------------- |
| Morgana        | Morrigan       |
| Sector Leaders | Visual Leaders |
| UI JS          | UI CSS         |
| Utils          | Foundation     |

---

## ⭐ Conclusion

The system’s CSS is not a collection of loose styles,  
but a **governed visual system**, with clear hierarchy
and a single entry point.

**Morrigan ensures order.  
The rest ensures form.**
