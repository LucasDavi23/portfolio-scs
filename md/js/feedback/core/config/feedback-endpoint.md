# 🌉 Ponteira — Feedback Endpoint Configuration

## 📖 Visão Geral

**Ponteira** centraliza o endpoint utilizado pelo sistema de feedback
para comunicação com o backend do **Google Apps Script**.

Ela define a **URL base utilizada por todos os módulos**
que enviam ou recebem dados da API.

Essa centralização garante consistência no sistema,
facilita manutenção e evita repetição de URLs no código.

---

## 🧱 Estrutura

Feedback System  
└ Core / Config  
  └ Ponteira — Endpoint Configuration

---

## 🔄 Fluxo de Uso

Frontend Modules  
↓  
Ponteira (endpoint configuration)  
↓  
Google Apps Script Backend

Todos os módulos que precisam acessar a API utilizam
a configuração definida por Ponteira.

---

## 🔗 Integração com o Sistema

| Setor   | Uso                                  |
| ------- | ------------------------------------ |
| Form    | envia feedbacks para o backend       |
| Network | utiliza a URL base nas requisições   |
| Board   | consome os dados retornados pela API |

---

## 🧠 Observações Arquiteturais

Ponteira é uma **ferramenta de configuração**, não uma persona.

Sua função é:

- centralizar o endpoint da API
- evitar repetição de URLs
- facilitar a troca de ambiente ou backend

Caso o endpoint seja alterado, a atualização ocorre
apenas neste ponto do sistema.
