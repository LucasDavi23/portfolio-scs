# 📘 CSS Architecture

This document presents the **philosophy and organization of the system’s CSS architecture**.

The project adopts a **visual specialist-oriented modular structure**, where each domain has clear responsibilities, defined leaders and a predictable hierarchy of styles.

The CSS architecture was designed to maintain:

- visual clarity
- modularity
- simple maintenance
- consistency across sectors
- interface scalability

All visual organization follows the **Celine Dev identity**, applied as the conceptual base for naming, responsibilities and style structure.

---

# ✨ Celine Dev — Visual Core and CSS Hierarchy

The system’s CSS architecture treats styling as part of the **product structure**.

Here, CSS is not handled as an improvised complement, but as an organized layer responsible for **visual hierarchy, readability, consistency and structure**.

Each file exists to fulfill a **specific responsibility within the interface**.

---

# 🧭 General CSS Guidelines

- CSS is organized by **visual domain**, not by technology.
- Specialists handle specific parts of the interface.
- Leaders coordinate visual domains.
- Directors ensure order, entry points and predictability.
- No file mixes responsibilities.
- Variants **are not personas**.
- CSS does not replace JavaScript, and JavaScript does not replace CSS.

---

# 🧬 Persona vs Structure

## Persona (Visual Specialist)

A persona represents a **clear visual responsibility** within the system.

A persona:

- operates on readability, hierarchy, density or appearance
- does not execute logic
- has symbolic identity
- lives inside a specific domain

Examples:

- Aline
- Zara
- Elisa

---

## Leader (Visual Coordination)

A leader coordinates a **visual domain**.

A leader:

- does not style isolated details
- organizes rhythm, integration and visual coherence
- imports specialists
- defines structural decisions within the sector

Examples:

- Atlas
- Seren
- Nyla

---

## Director (Order and Entry)

A director operates at the **architecture organization layer**.

A director:

- does not style components
- does not define local layout
- centralizes imports
- defines the entry point
- guarantees predictability and modularity

Example:

- **Morrigan**

---

## Structural File (Non-Persona)

Structural files provide **technical support to the visual system** without symbolic identity.

Examples:

- Foundation
- modal-mobile
- notebook-scale

---

# 🌱 Persona Levels (Visual)

## 🟢 Apprentice

Responsible for **simple or localized adjustments**.

Characteristics:

- small visual scope
- easy to change or remove
- does not govern the system

---

## 🔵 Young

Defined visual responsibility inside a **subdomain**.

Characteristics:

- reusable
- operates in specific interface areas
- may still evolve

---

## 🟣 Adult

Structural specialist of the **visual system**.

Characteristics:

- defines or coordinates foundational structure
- changes are rare and deliberate
- if it breaks, the interface feels it

---

# 🧭 CSS Architecture Domains

The system’s CSS architecture is organized into **three major domains**.

---

## 🜃 System

Responsible for:

- global visual base
- typography
- shared UI
- import order
- entry point

📄 Documented in `system-css.md`

---

## 🧭 Layout

Responsible for:

- macro structure
- local layouts
- responsiveness
- scale and adaptation

📄 Documented in `layout-css.md`

---

## 🎯 Feedback

Responsible for:

- section layout
- feedback board
- feedback form
- structural variants

📄 Documented in `feedback-css.md`

---

# 🧠 Fundamental Principles

- CSS is a **system**, not decoration.
- Layout defines structure, not appearance.
- UI defines patterns, not context.
- Typography defines language, not layout.
- Feedback does not redefine global rules.
- No domain governs another outside its responsibility.

---

# 🔗 Relationship with JavaScript

CSS and JavaScript are independent layers, but conceptually symmetrical.

| JavaScript (Logic) | CSS (Visual)             |
| ------------------ | ------------------------ |
| Morgana            | Morrigan                 |
| Sector Leaders     | Visual Leaders           |
| UI JS              | UI CSS                   |
| Pure Utils         | Foundation / adjustments |

Each layer evolves independently while maintaining conceptual alignment between **logic and interface**.

---

# 🪶 Final Principle

The system’s CSS possesses:

- hierarchy
- leadership
- identity
- entry point
- conscious organization

Every file exists for a reason.  
Every name carries a responsibility.

Visual form is not improvised — it is part of the **product architecture**.
