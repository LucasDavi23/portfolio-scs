# 🜁 Arquitetura Geral do Sistema

### Governança de Morgana — Diretora Geral

Este documento apresenta o **mapa estrutural completo do sistema**,  
mostrando todos os setores, líderes e suas subdivisões internas.  
Morgana supervisiona tudo e garante a ordem de inicialização e modularidade.

---

## 🧭 Visão Geral dos Setores

| Setor                | Líder     | Pasta Base         | Papel Técnico Resumido                                                    |
| -------------------- | --------- | ------------------ | ------------------------------------------------------------------------- |
| **Layout**           | Aurora 🌇 | `/layout`          | Interface principal: carrossel, navegação, modal, efeitos, foundation.    |
| **Feedback (Board)** | Selah 🌿  | `/feedback/board`  | Sistema de avaliações: cards, lista, summary, avatares e board principal. |
| **Sistema (Core)**   | Morgana 🜁 | `/system`          | Diretoria geral: inicialização global de todos os setores.                |
| **Futuros setores**  | —         | `/pedidos`, `/orc` | Ex.: pedidos, orçamento, catálogo, marketplace.                           |

---

# 🧩 Estrutura detalhada sob a supervisão de Morgana

---

## 1) 🌇 Setor Layout (Líder: Aurora)

/layout
| foundation/
| └── Luna 🌙 — base do layout
|
| nav/submenu/
| └── Navi 🧭 — controle do menu mobile
|
| effects/scroll/
| └── Aura 🌬️ — efeitos de scroll
|
| modal/
| └── Iris 👁️ — modal de imagem global
|
| hero/carousel/
| ├── Nami 🎠 — controle lógico do carrossel
| └── Yume 🌌 — animações do carrossel (futuro)
|
└ leader/
└── Aurora 🌇 — coordenação do setor

Aurora responde diretamente à Morgana, apenas no momento de inicialização.

---

## 2) 🌿 Setor Feedback (Líder: Selah)

/feedback/board
|
| api/
| ├── Nádia 🧬 — Core API
| └── Naomi 🍃 — Card API (normalização)
|
| main/
| ├── Selah 🌿 — UI principal do board
| ├── Elara 🌿 — helpers do board
| └── Lia 🌱 — preload da API
|
| summary/
| ├── Abigail 🌟 — UI do summary
| └── Athenais 🌟 — lógica do summary
|
| image/
| ├── Petra 🪷 — UI de imagens
| └── Dália 🪷 — helpers de imagem
|
| avatar/
| ├── Lívia 🌷 — UI do avatar
| └── Helena 🌷 — helpers de avatar
|
└ list/
├── Mira 🌸 — List UI (modal Ver Mais)
└── Dara 🌸 — helpers da lista

Selah responde a Morgana apenas quando a diretora geral inicializa o setor completo.

---

## 3) 🜁 Núcleo do Sistema (Direção Geral: Morgana)

/system/director
└── Morgana 🜁 — inicialização global
Morgana:

- chama Aurora (Layout)
- futuramente chamará Selah (Feedback)
- depois chamará Pedidos, Orçamento, etc.
- define a ordem de carregamento do sistema
- mantém o sistema modular e escalável

---

# 🎯 Fluxo oficial de inicialização (flow chart simplificado)

Morgana
├── Aurora (Layout)
│ ├── Luna
│ ├── Navi
│ ├── Aura
│ ├── Iris
│ ├── Nami
│ └── Yume
│
├── Selah (Feedback) ← futuro próximo
│ ├── Nádia / Naomi
│ ├── Abigaíl / Athenais
│ ├── Petra / Dália
│ ├── Mira / Dara
│ └── Lívia / Helena
│
└── (Pedidos / Orçamentos / Catálogo) ← expansões futuras

# ⭐ Conclusão

Este documento serve como **mapa-mestre do sistema**.  
Sempre que novos módulos forem criados, eles devem ser encaixados aqui.

---
