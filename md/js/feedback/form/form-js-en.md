# 📘 System Architecture — Form (JavaScript)

### Governance by Aura — Form Direction

The **Form** module is responsible for handling the behavior, validation and submission flow of the feedback form.

This layer coordinates user interaction with the form, ensures input validation, manages submission flow and integrates with the backend through specialized network modules.

The governance of **Aura** ensures that all specialists operate in the correct order, maintaining a **stable, predictable and modular submission flow**.

Aura does not execute validations, process images or perform network requests directly — her role is **pure coordination** of the Form sector.

---

# 🧭 Form Sectors Overview

| Sector            | Responsible | Role                                                |
| ----------------- | ----------- | --------------------------------------------------- |
| Coordination      | Aura        | Orchestrates the form flow and specialists          |
| Validation        | Sofia       | Form validation and UX state control                |
| Rating UI         | Ayla        | Star rating interaction inside the form             |
| Rating Logic      | Zaya        | Final rating resolution and normalization           |
| Photo UI          | Daphne      | File input and preview handling                     |
| Image Processing  | Athena      | Local image validation, conversion and compression  |
| Photo Preview UX  | Irene       | Visual preview card and modal interaction           |
| Comment UX        | Mina        | Character counter for the comment field             |
| Name Guard        | Clara       | Name normalization and profanity filtering          |
| Network Core      | Vesper      | Base network layer for form requests                |
| API Gateway       | Elis        | Sends feedback payload to the backend               |
| Sender            | Gael        | Handles submission result and error classification  |
| Image Upload API  | Lyra        | Handles image upload requests                       |
| List API          | Mirael      | Retrieves feedback data from the backend            |
| Flow Conductor    | Liora       | Connects form events and delegates responsibilities |
| Event Messenger   | Nysa        | Emits internal feedback events                      |
| Submit Specialist | Selene      | Executes the final submission flow                  |
| Queue             | Alma        | Stores failed submissions locally                   |
| Outbox Processor  | Noah        | Retries queued submissions with backoff             |

---

# 🌸 Form Personas

| Persona | Role                                         |
| ------- | -------------------------------------------- |
| Aura    | Coordination of the Form module              |
| Sofia   | Form validation and UX state management      |
| Ayla    | Rating star UI inside the form               |
| Zaya    | Rating normalization and resolution          |
| Daphne  | File input UI and image preview              |
| Athena  | Image validation, conversion and compression |
| Irene   | Photo preview UX                             |
| Mina    | Comment character counter                    |
| Clara   | Name normalization and profanity filtering   |
| Vesper  | Core network layer                           |
| Elis    | Feedback API gateway                         |
| Gael    | Feedback sender                              |
| Lyra    | Image upload API                             |
| Mirael  | Feedback list API                            |
| Liora   | Form flow conductor                          |
| Nysa    | Feedback event messenger                     |
| Selene  | Feedback submit specialist                   |
| Alma    | Submit queue storage                         |
| Noah    | Outbox processor                             |

---

# 🌳 Form Structure

```
/form
│
├─ coordination
│ └── Aura
│
├─ validation
│ ├── Sofia
│ └── Clara
│
├─ rating
│ ├── Ayla
│ └── Zaya
│
├─ photo
│ ├── Daphne
│ ├── Athena
│ └── Irene
│
├─ ux
│ └── Mina
│
├─ network
│ ├── Vesper
│ ├── Elis
│ ├── Gael
│ ├── Lyra
│ └── Mirael
│
├─ flow
│ ├── Liora
│ ├── Nysa
│ └── Selene
│
└─ resilience
  ├── Alma
  └── Noah

```
