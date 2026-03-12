# 📘 Arquitetura do Sistema — System (JavaScript)

### Governança de Morgana — Direção do Sistema

O **System** representa o núcleo estrutural do JavaScript da aplicação.

Essa camada reúne a **diretoria geral, utilidades globais e especialistas reutilizáveis** que sustentam o funcionamento dos demais módulos do sistema.

Seu papel é garantir **organização, previsibilidade e consistência técnica**,
permitindo que setores como Layout, Board, Form e futuros módulos operem
sobre uma base estável.

A governança de **Morgana** coordena essa base sem interferir na lógica
interna de cada setor.

---

# 🧭 Visão Geral dos Setores (System)

| Setor          | Responsável | Papel                                            |
| -------------- | ----------- | ------------------------------------------------ |
| Direção        | Morgana     | Coordenação e inicialização do núcleo do sistema |
| Utils          | Juniper     | Utilidades globais reutilizáveis                 |
| Touch Guard    | Onyx        | Interpretação correta de gestos de toque         |
| Scroll Control | Latch       | Travamento e restauração do scroll               |
| Loading UI     | Luma        | Estados visuais globais de carregamento          |
| Submit UI      | Stella      | Overlay de processamento para submits            |
| Message UI     | Halo        | Componente global de mensagens                   |
| Rating UI      | Zoe         | Representação visual de avaliações               |

---

# 🌸 Personas do System

| Persona | Função                                           |
| ------- | ------------------------------------------------ |
| Morgana | Coordenação e inicialização do núcleo do sistema |
| Juniper | Manipulação e formatação de datas                |
| Onyx    | Interpretação segura de gestos de toque          |
| Latch   | Controle de scroll para modais                   |
| Luma    | Interface global de loading                      |
| Stella  | Overlay de processamento de submit               |
| Halo    | Sistema de mensagens flutuantes                  |
| Zoe     | Representação visual de rating                   |

---

# 🧰 Ferramentas do System

| Ferramenta | Função                                 |
| ---------- | -------------------------------------- |
| Logger     | Padronização e observabilidade de logs |
| UUID       | Geração de identificadores únicos      |

---

# 🌳 Planta do System

```
/system
│
├─ director/
│   └── Morgana
│
├─ utils/
│   ├── Juniper
│   ├── Onyx
│   ├── Latch
│   ├── Logger (tool)
│   └── UUID (tool)
│
└─ ui/
    ├── Luma
    ├── Stella
    ├── Halo
    └── Zoe
```
