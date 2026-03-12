# ✨ Celine Dev — Modular JavaScript Architecture

A modular JavaScript architecture oriented around specialists (personas), designed to keep systems organized, predictable and easy to evolve.

This document defines the **philosophy and organization of the system’s JavaScript architecture**.

The project follows a **specialist-oriented modular model (personas)**, where each part of the system has a clear responsibility.

The goal is to maintain:

- clarity
- modularity
- simple maintenance
- educational architecture

All JavaScript logic in the project follows the **Celine Dev identity**, created to make the system more organized, understandable and pleasant to evolve.

---

# 🧭 System Philosophy

The system is organized as a **set of specialists**, where each module handles a specific part of the application.

Each specialist:

- has a clear responsibility
- avoids overlapping roles
- collaborates with other modules in a predictable way

This keeps the system **modular and easy to maintain**.

---

# 🧬 Persona vs Tool

## Persona

A **persona** represents a specialized module within the system.

A persona:

- has a defined responsibility
- may take flow decisions
- interacts with other personas

Examples:

- Selah → Board UI
- Nádia → Network layer
- Aurora → Layout leader

---

## Tool

Tools are **utility modules**.

They:

- perform mechanical tasks
- contain no domain logic
- can be reused by multiple personas

Examples:

- helpers
- parsers
- validation utilities

---

# 🌱 Persona Levels

The system uses three specialization levels.

## 🟢 Apprentice

Responsible for simple and well-defined tasks.

Characteristics:

- small scope
- may evolve or be replaced
- usually assists another persona

---

## 🔵 Young

Intermediate specialist inside a sector.

Characteristics:

- clear responsibility
- may integrate behaviors or data
- can still evolve with the system

---

## 🟣 Adult

Stable specialist of the architecture.

Characteristics:

- well-defined responsibility
- used by several modules
- considered structural within the system

Examples:

- Luma (loading)
- Zoe (rating)

---

# 📘 JavaScript Architecture

The JavaScript architecture of the system is organized into **main modules**, each governed by a leader responsible for coordinating the sector’s specialists.

Morgana (System Core)
│
├ Layout → Aurora
├ Board → Selah
└ Form → Aura

Each module has its own internal structure and documentation.

---

# 🧩 Module Documentation

The detailed architecture of each sector is available in the following documents:

system-js.md
layout-js.md
board-js.md
form-js.md

These documents describe the internal organization of each module, their specialists and responsibilities.

---

# 🪶 Final Principle

The system was designed to be **clear, modular and easy to maintain**.

Each specialist takes care of a specific part of the system, while tools silently provide technical support.

This approach allows the project to grow while maintaining **order, clarity and architectural stability**.
