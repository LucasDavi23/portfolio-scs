# 🖼️ Feedback Image Endpoint

## 📖 Visão Geral

**PT:**  
Este endpoint é responsável pelo **processamento e entrega de imagens** do sistema de feedback.

Ele é utilizado para:

- upload de imagens
- recuperação de imagens (preview)
- proxy de imagens do Google Drive

**EN:**  
This endpoint is responsible for **image processing and delivery** in the feedback system.

It is used for:

- image upload
- image retrieval (preview)
- Google Drive image proxy

---

## 🧱 Estrutura

Feedback System  
└ Core / Config  
  └ Image Endpoint

---

## 🔄 Fluxo de Uso

Frontend Modules  
↓  
Image Endpoint (/gas-img)  
↓  
Google Apps Script Backend  
↓  
Google Drive / Storage

---

## 🔗 Integração com o Sistema

| Setor / Layer | Uso / Usage                         |
| ------------- | ----------------------------------- |
| Form          | upload de imagem / image upload     |
| Board         | exibição de imagens / image display |
| Helpers       | proxy e fallback / proxy & fallback |

---

## 🧠 Observações Arquiteturais

**PT:**

- Separação de responsabilidade (dados ≠ mídia)
- Permite otimizações específicas de imagem
- Facilita cache e fallback

**EN:**

- Separation of concerns (data ≠ media)
- Enables image-specific optimizations
- Improves caching and fallback strategies

---

## ⚙️ Endpoint
