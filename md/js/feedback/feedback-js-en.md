# 📘 System Architecture — Feedback JS

### System Governance

**Feedback JS** represents the complete system responsible for **collecting, processing and displaying user reviews** within the application.

This system connects several sectors of the project:

- **Submission form**
- **Network and API layer**
- **Data processing**
- **Review board rendering**
- **Statistical summary**
- **List modal**
- **Avatar system**
- **Image handling**
- **Preload and performance optimization**

The visual organization and experience of the feedback system follow an architectural pattern that ensures consistency between **data, rendering and interface behavior**.

---

# 🧭 What the Feedback System Is

**Feedback JS** is a modular system responsible for managing the entire lifecycle of user reviews.

This lifecycle includes:

1. **Data input** through the form
2. **Persistence** in the backend (Apps Script)
3. **Query and caching** of reviews
4. **Processing and normalization**
5. **Visual rendering on the board**
6. **Statistical calculation (summary)**
7. **Expanded listing through the modal**
8. **Visual handling of images and avatars**

The architecture was designed to maintain:

- clear separation of responsibilities
- modularity
- easier maintenance
- performance and visual stability

---

# 🧱 Feedback System Sectors

The system is divided into specialized sectors.

| Sector        | Role                                     |
| ------------- | ---------------------------------------- |
| Form          | Review submission                        |
| Network / API | Communication with Apps Script           |
| Board         | Rendering the review board               |
| Summary       | Review statistics                        |
| List Modal    | Expansion of the complete list           |
| Avatar        | Textual visual identity of the author    |
| Images        | Image validation and fallback            |
| Preload       | API warm-up and performance optimization |
| Helpers       | Intermediate data processing             |

Each sector contains **specialized personas** responsible for maintaining the architectural organization.

---

# ⚙️ Layered Architecture

Feedback JS follows a well-defined layered structure.

### Input Layer

Responsible for collecting reviews.

Examples:

- feedback form
- field validation
- submission to the backend

---

### Network Layer

Centralizes communication with the backend.

Responsible for:

- HTTP requests
- timeout control
- automatic retry
- data caching

This layer prevents visual parts of the system from making direct network calls.

---

### Processing Layer

Responsible for preparing data before rendering.

Tasks include:

- data normalization
- pagination
- image selection
- statistical calculations
- structure transformation

---

### Visual Layer

Responsible for displaying processed data.

Includes:

- review board
- feedback cards
- listing modal
- review summary
- author avatar
- image rendering

---

# 🔄 Feedback System Flow

The complete system flow can be represented as follows:

User submits a review
↓
Form validates the data
↓
Apps Script receives and stores it
↓
Network layer queries the data
↓
Adapter converts the data
↓
Helpers process the information
↓
Board renders the review wall
↓
Summary calculates statistics
↓
Modal enables expanded navigation

This flow ensures that each layer performs **one specific responsibility**.

---

# 🔗 Integration Between Form and Board

The feedback system connects two major sectors of the project:

### Form

Responsible for:

- collecting reviews
- validating data
- sending data to the backend

### Board

Responsible for:

- querying reviews
- processing data
- rendering the review board
- providing expanded navigation

This separation allows the system to keep **input and visualization decoupled**.

---

# 🧠 Personas by System Function

Personas represent roles within the architecture.

### Network and API

Responsible for backend communication.

- **Nádia** — network core and requests
- **Naomi** — API data adapter

---

### Data Processing

Responsible for preparing data for display.

- **Elara** — board data processing
- **Dara** — list processing
- **Athenais** — summary calculation
- **Helena** — avatar logic
- **Dália** — image logic

---

### Visual Layer

Responsible for the system interface.

- **Selah** — review board UI
- **Mira** — list modal
- **Abigaíl** — summary UI
- **Lívia** — avatar UI
- **Petra** — image rendering

---

### Optimization and Performance

Responsible for improving initial loading.

- **Lia** — API preload

---

# 📜 Architectural Rules

Feedback JS follows several important rules:

- Visual layers **do not perform network requests directly**
- Pure helpers **do not manipulate the DOM**
- External communication passes through the **centralized network layer**
- Data processing occurs **before rendering**
- Each persona has **one specific responsibility**
- Data logic and interface remain **separated**

These rules guarantee **organization and predictability within the system**.

---

# 🌳 Feedback JS System Structure

```

Feedback JS
│
├─ Input
│ └─ Form (review submission)
│
├─ Communication
│ ├─ Nádia — network / requests
│ └─ Naomi — data adaptation
│
├─ Processing
│ ├─ Elara — board preparation
│ ├─ Dara — list preparation
│ ├─ Athenais — summary calculation
│ ├─ Helena — avatar logic
│ └─ Dália — image logic
│
├─ Interface
│ ├─ Selah — review board
│ ├─ Mira — listing modal
│ ├─ Abigaíl — summary UI
│ ├─ Lívia — avatar UI
│ └─ Petra — image rendering
│
└─ Optimization
  └─ Lia — preload and API warm-up

```
