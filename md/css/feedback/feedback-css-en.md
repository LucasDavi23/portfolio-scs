# 🎯 Feedback — CSS Architecture

This document describes the architecture of the **Feedback module CSS**.  
It does not contain the styles themselves, but **how they are organized**, **who is responsible for what**, and **how the layers relate to each other**.

The Feedback module is composed of two main layers:

1. Board (review display)
2. Form (feedback submission)

---

The layout structure of the Feedback section is primarily managed
through Tailwind utilities in the HTML.

The CSS layer focuses on **specific visual responsibilities**, such as cards, avatars, rating components and form styling.

---

## 🧩 1. Review Board (Seren)

Responsible for **displaying completed reviews**.  
The board does not handle data input — it focuses only on reading and presentation.

### 🌿 Leadership

- **Seren** — coordinates rhythm, spacing and overall board organization

### 🎴 Structure

- **Aline** — visual structure of the cards (containers, borders, backgrounds and shadows)

### 👤 Identity and Content

- **Tessa** — feedback image
- **Zara** — visual presentation of the rating (stars)
- **Marka** — badges and context/source indicators

### 🧩 Variants

- **Compact** — dense board mode that reduces spacing
  and the layout density of cards  
  (structural decision under Seren’s leadership)

---

## 📝 2. Feedback Form (Nyla)

Responsible for the **visual interface of feedback submission**.

### 🌾 Leadership

- **Nyla** — coordinates the visual structure of the form module
  and centralizes the import of specialists

### 📝 Interface

- **Elisa** — fields, labels, error messages and visual states

The form handles **visual presentation only**.  
Validation, submission and logic belong to JavaScript.

---

## 🧠 Architectural Principles

- CSS is organized by **visual domain**, not by technology
- Specialists handle specific parts of the interface
- Leaders coordinate visual groups
- Variants are structural decisions, not personas
- No Feedback CSS file defines global system rules

---

## 🔗 System Relationships

- **Atlas** defines the global layout
- **Lexa** defines the base typography
- **Vega** defines shared UI components
- **Foundation** supports structural rules
- **Morrigan** acts as the system CSS entry point

The Feedback module **uses these foundations but does not redefine them**.

---

## ✅ Scope

This document covers **only the CSS architecture of the Feedback module**.

Other aspects of the system are documented in their respective files:

- `layout-css.md`
- `system-css.md`
