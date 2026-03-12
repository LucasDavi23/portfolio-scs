# 📘 Arquitetura do Sistema — Feedback JS

### Governança do Sistema

O **Feedback JS** representa o sistema completo responsável por **coletar, processar e exibir avaliações de usuários** dentro da aplicação.

Esse sistema conecta diferentes setores do projeto:

- **Formulário de envio**
- **Camada de rede e API**
- **Processamento dos dados**
- **Renderização do mural de avaliações**
- **Resumo estatístico (summary)**
- **Modal de listagem**
- **Sistema de avatar**
- **Tratamento de imagens**
- **Preload e otimização de carregamento**

A organização visual e a experiência do sistema de feedback seguem um padrão arquitetural que garante consistência entre dados, renderização e comportamento da interface.

# 🧭 O que é o Sistema de Feedback

O **Feedback JS** é um sistema modular responsável por gerenciar todo o ciclo de vida das avaliações dos usuários.

Esse ciclo inclui:

1. **Entrada de dados** pelo formulário
2. **Persistência** no backend (Apps Script)
3. **Consulta e cache** das avaliações
4. **Processamento e normalização**
5. **Renderização visual no mural**
6. **Cálculo de estatísticas (summary)**
7. **Expansão da listagem no modal**
8. **Tratamento visual de imagens e avatar**

A arquitetura foi projetada para manter:

- separação clara de responsabilidades
- modularidade
- manutenção facilitada
- performance e estabilidade visual

---

# 🧱 Setores do Sistema de Feedback

O sistema é dividido em setores especializados.

| Setor       | Função                               |
| ----------- | ------------------------------------ |
| Form        | Entrada de avaliações                |
| Rede / API  | Comunicação com Apps Script          |
| Board       | Renderização do mural de avaliações  |
| Summary     | Estatísticas das avaliações          |
| Modal LISTA | Expansão da listagem completa        |
| Avatar      | Identidade visual textual do autor   |
| Imagens     | Validação e fallback de imagens      |
| Preload     | Aquecimento da API e otimização      |
| Helpers     | Processamento intermediário de dados |

Cada setor possui **personas especializadas**, responsáveis por manter a organização da arquitetura.

---

# ⚙️ Arquitetura por Camadas

O Feedback JS segue uma estrutura de camadas bem definidas.

### Camada de Entrada

Responsável pela coleta das avaliações.

Exemplo:

- Formulário de feedback
- validação de campos
- envio ao backend

---

### Camada de Rede

Centraliza a comunicação com o backend.

Responsável por:

- requisições HTTP
- controle de timeout
- retry automático
- cache de dados

Essa camada evita que partes visuais do sistema façam chamadas diretas de rede.

---

### Camada de Processamento

Responsável por preparar os dados antes da renderização.

Aqui acontecem:

- normalização de dados
- paginação
- seleção de imagens
- cálculo de estatísticas
- transformação de estruturas

---

### Camada Visual

Responsável por exibir os dados processados.

Inclui:

- mural de avaliações
- cards de feedback
- modal de listagem
- resumo de avaliações
- avatar do autor
- renderização de imagens

---

# 🔄 Fluxo Geral do Sistema de Feedback

O funcionamento completo do sistema pode ser representado da seguinte forma:

```
Usuário envia avaliação
↓
Formulário valida os dados
↓
Apps Script recebe e salva
↓
Camada de rede consulta os dados
↓
Adapter converte os dados
↓
Helpers processam as informações
↓
Board renderiza o mural de avaliações
↓
Summary calcula estatísticas
↓
Modal permite navegação expandida
```

Esse fluxo garante que cada camada execute **uma responsabilidade específica**.

---

# 🔗 Integração entre Form e Board

O sistema de feedback conecta dois grandes setores do projeto:

### Form

Responsável por:

- coletar avaliações
- validar dados
- enviar para o backend

### Board

Responsável por:

- consultar as avaliações
- processar os dados
- exibir o mural
- fornecer navegação expandida

Essa separação permite que o sistema mantenha **entrada e visualização desacopladas**.

---

# 🧠 Personas por Função no Sistema

As personas representam papéis dentro da arquitetura.

### Rede e API

Responsáveis pela comunicação com o backend.

- **Nádia** — núcleo de rede e requisições
- **Naomi** — adaptação dos dados da API

---

### Processamento de Dados

Responsáveis por preparar os dados para exibição.

- **Elara** — processamento do board
- **Dara** — processamento da listagem
- **Athenais** — cálculo do summary
- **Helena** — lógica de avatar
- **Dália** — lógica de imagens

---

### Camada Visual

Responsáveis pela interface do sistema.

- **Selah** — mural de avaliações
- **Mira** — modal de listagem
- **Abigaíl** — interface do summary
- **Lívia** — avatar visual
- **Petra** — renderização de imagens

---

### Otimização e Performance

Responsável por melhorar o carregamento inicial.

- **Lia** — preload da API

---

# 📜 Regras Arquiteturais do Sistema

O Feedback JS segue algumas regras importantes:

- Camadas visuais **não fazem chamadas de rede diretamente**
- Helpers puros **não manipulam DOM**
- Comunicação externa passa pela **camada de rede centralizada**
- Processamento de dados acontece **antes da renderização**
- Cada persona possui **um papel específico dentro do sistema**
- Lógica de dados e interface permanecem **separadas**

Essas regras garantem **organização e previsibilidade no sistema**.

---

# 🌳 Planta Geral do Sistema Feedback JS

```
Feedback JS
│
├─ Entrada
│   └─ Form (envio de avaliações)
│
├─ Comunicação
│   ├─ Nádia — rede / requisições
│   └─ Naomi — adaptação de dados
│
├─ Processamento
│   ├─ Elara — preparação do board
│   ├─ Dara — preparação da lista
│   ├─ Athenais — cálculo do summary
│   ├─ Helena — lógica do avatar
│   └─ Dália — lógica de imagens
│
├─ Interface
│   ├─ Selah — mural de avaliações
│   ├─ Mira — modal de listagem
│   ├─ Abigaíl — interface do summary
│   ├─ Lívia — avatar visual
│   └─ Petra — renderização de imagens
│
└─ Otimização
    └─ Lia — preload e aquecimento da API

```

---
