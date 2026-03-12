# 📘 System Architecture — Layout (JavaScript)

### Governance by Aurora — Layout Direction

The **Layout** module is responsible for controlling the structural behaviors of the application's interface.

This layer organizes essential navigation and interaction elements of the page — such as mobile navigation, image modals and the main carousel — ensuring visual consistency and smooth user experience.

The governance of **Aurora** coordinates the layout modules, initializing each component in the correct order and keeping the interface structure stable and modular.

---

# 🧭 Layout Sectors Overview

| Sector       | Responsible | Role                                   |
| ------------ | ----------- | -------------------------------------- |
| Foundation   | Luna        | Basic layout utilities                 |
| Navigation   | Navi / Nara | Menu control and navigation state      |
| Modal        | Iris        | Enlarged image viewer                  |
| Modal Motion | Vela        | Modal animation standardization        |
| Form Modal   | Lyra        | Form modal control                     |
| Viewer       | Echo        | Image gallery navigation               |
| Carousel     | Nami        | Carousel logic control                 |
| Scroll       | Aura        | Reserved space for scroll effects      |
| Animation    | Yume        | Future carousel animation layer        |
| Coordination | Aurora      | Layout initialization and coordination |

---

# 🌸 Layout Personas

| Persona | Role                               |
| ------- | ---------------------------------- |
| Aurora  | General coordination of the Layout |
| Luna    | Layout foundation utilities        |
| Navi    | Mobile navigation control          |
| Nara    | Active navigation state detection  |
| Iris    | Image modal viewer                 |
| Echo    | Image navigation inside the modal  |
| Lyra    | Form modal controller              |
| Vela    | Modal motion and transitions       |
| Nami    | Main carousel controller           |
| Aura    | Scroll behavior placeholder        |
| Yume    | Future animation layer             |

---

# 🌳 Layout Structure

```

Layout
│
├─ Coordenação
│ └ Aurora
│
├─ Fundação
│ └ Luna
│
├─ Navegação
│ ├ Navi
│ └ Nara
│
├─ Modal
│ ├ Iris
│ ├ Vela
│ └ Echo
│
├─ Form Modal
│ └ Lyra
│
├─ Carrossel
│ ├ Nami
│ └ Yume
│
└─ Scroll
    └ Aura

```
