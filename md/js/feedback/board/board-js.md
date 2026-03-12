# 📘 Arquitetura do Sistema — Board

### Governança de Celine — Direção de Experiência e Interface

O **Board de Avaliações** é responsável por coletar, processar e exibir feedbacks de clientes em formato de mural interativo.

Essa camada integra dados vindos do **Apps Script**, organiza as avaliações e renderiza os cards na interface, mantendo performance, clareza visual e fluidez de navegação.

A governança de **Celine** define o padrão de experiência do sistema, garantindo consistência entre lógica de dados, renderização visual e comportamento da interface.

---

# 🧭 Visão Geral dos Setores (Board)

| Setor         | Responsável        | Papel                                   |
| ------------- | ------------------ | --------------------------------------- |
| Rede          | Nádia              | Camada central de comunicação com a API |
| API / Adapter | Naomi              | Conversão dos dados da API em cards     |
| Processamento | Elara              | Preparação dos dados do board           |
| Lista         | Dara               | Helpers da listagem de avaliações       |
| Modal         | Mira               | Interface expandida da lista            |
| UI            | Selah              | Renderização do mural de avaliações     |
| Preload       | Lia                | Aquecimento da API                      |
| Avatar        | Helena / Lívia     | Sistema de iniciais                     |
| Imagens       | Dália / Petra      | Lógica e renderização de imagens        |
| Summary       | Athenais / Abigaíl | Estatísticas e interface do resumo      |

---

# 🌸 Personas do Board

## 🧬 Nádia — Core da API (Rede)

Camada central de comunicação com a API.  
Fornece a base de rede utilizada por todo o Board.

---

## 🌸 Naomi — FeedbackCardAPI

Adapter responsável por transformar os dados do Apps Script em
cards de feedback padronizados.

---

## 🌿 Elara — Helpers do Board

Processa e normaliza os dados do Board antes da renderização.

---

## 🌸 Dara — Helpers da Lista

Responsável pelas transformações e paginação da listagem de avaliações.

---

## 🌸 Mira — Modal da Lista

Controla a exibição expandida das avaliações no modal “Ver Mais”.

---

## 🌿 Selah — Board de Avaliações (UI)

Responsável pela renderização do mural principal de avaliações.

---

## 🌱 Lia — Preload do Board

Executa chamadas leves para manter a API aquecida.

---

## 🌷 Helena — Helpers do Avatar

Lógica responsável pela geração das iniciais do avatar.

---

## 🌷 Lívia — Avatar UI

Camada visual responsável pela exibição dos avatares.

---

## 🪷 Dália — Lógica de Imagens

Validação e normalização das URLs de imagem.

---

## 🪷 Petra — Imagens (UI)

Aplicação de fallback, retry e estabilidade visual das imagens.

---

## 🌟 Athenais — Lógica do Summary

Processa os dados brutos de avaliações e gera o objeto de summary.

---

## 🌟 Abigaíl — Summary UI

Coordena a exibição visual do resumo de avaliações.

---

# 🌳 Planta do Board

```
Board
│
├─ Network
│   └─ Nádia
│
├─ API / Adapter
│   └─ Naomi
│
├─ Processing
│   ├─ Elara
│   └─ Dara
│
├─ List Modal
│   └─ Mira
│
├─ UI
│   └─ Selah
│
├─ Preload
│   └─ Lia
│
├─ Avatar
│   ├─ Helena
│   └─ Lívia
│
├─ Images
│   ├─ Dália
│   └─ Petra
│
└─ Summary
    ├─ Athenais
    └─ Abigaíl
```

---
