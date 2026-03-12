# 🧾 Form — Feedback Submission Module

## Overview

O módulo **Form** é responsável por coletar, validar e enviar feedbacks dos usuários.

Ele organiza a interação do formulário e coordena especialistas responsáveis por:

- UI e experiência do usuário
- validação e consistência dos dados
- processamento de imagens
- comunicação com o backend
- resiliência em caso de falhas

A arquitetura do Form segue um modelo **modular orientado a especialistas**, onde cada persona possui responsabilidades bem definidas.

# Architecture

```

Form
├ Leader
│ └ Aura
│
├ Flow
│ └ Liora
│
├ Network
│ └ Vesper
│
├ Submission
│ ├ Selene
│ ├ Gael
│ └ Elis
│
├ Data Fetch
│ └ Mirael
│
├ Upload
│ └ Lyra
│
├ Image
│ ├ Daphne
│ └ Athena
│
├ Rating
│ ├ Ayla
│ └ Zaya
│
├ Validation
│ └ Sofia
│
├ Input Guard
│ └ Clara
│
├ UX
│ ├ Irene
│ └ Mina
│
├ Events
│ └ Nysa
│
└ Outbox
    ├ Alma (queue guardian)
    └ Noah (outbox processor)

```

---

# Submission Flow

```

User Interaction
↓
Ayla (rating UI)
↓
Sofia (validation & UX state)
↓
Liora (form flow conductor)
↓
Selene (submit specialist)
↓
Gael (sender)
↓
Elis (API gateway)
↓
Vesper (network core)
↓
Apps Script

```

---

# Image Flow

```

Photo Input
↓
Daphne (photo UI)
↓
Irene (preview UX)
↓
Athena (image processing)
↓
Lyra (upload contract)
↓
Vesper (network core)

```

---

# Resilience Flow

```

Submit Attempt
↓
Gael (sender)
↓
Failure
↓
Alma (queue guardian)
↓
Noah (outbox processor)
↓
Retry / eventual delivery

```

---

# Architectural Principles

O módulo Form segue alguns princípios fundamentais:

- **Separação de responsabilidades** — cada especialista possui um papel específico.
- **Baixo acoplamento** — UI, validação, rede e processamento são isolados.
- **Resiliência** — falhas de rede não quebram o fluxo.
- **Previsibilidade** — o fluxo de execução é controlado pelo condutor do formulário.

```

```
