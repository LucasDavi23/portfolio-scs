# 🔗 Feedback Data Endpoint

## 📖 Visão Geral

**PT:**  
Este endpoint é responsável por todas as operações de **dados do sistema de feedback**.

Ele é utilizado para:

- envio de feedback
- listagem de avaliações
- consultas de dados

**EN:**  
This endpoint is responsible for all **feedback system data operations**.

It is used for:

- sending feedback
- listing reviews
- querying data

---

## 🧱 Estrutura

Feedback System  
└ Core / Config  
  └ Data Endpoint

---

## 🔄 Fluxo de Uso

Frontend Modules  
↓  
Data Endpoint (/gas)  
↓  
Google Apps Script Backend

---

## 🔗 Integração com o Sistema

| Setor / Layer | Uso / Usage                           |
| ------------- | ------------------------------------- |
| Form          | envio de feedback / send feedback     |
| Network       | requisições HTTP / HTTP requests      |
| Board         | leitura de avaliações / fetch reviews |

---

## 🧠 Observações Arquiteturais

**PT:**

- Centraliza comunicação de dados
- Evita repetição de URLs
- Facilita troca de backend

**EN:**

- Centralizes data communication
- Avoids URL duplication
- Simplifies backend replacement

---

## ⚙️ Endpoint
