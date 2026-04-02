# ⚙️ Installation Guide — Portfolio SCS

## Visão geral

Este projeto utiliza:

- Vite (build tool)
- Tailwind CSS
- JavaScript modular
- Google Apps Script (backend da API)

---

## 📌 Requisitos

Antes de iniciar:

- Node.js 18+
- npm
- Navegador moderno

---

## 📦 Instalar dependências

```bash
npm install
```

As dependências são gerenciadas automaticamente pelo `package.json`.

---

## 🚀 Rodar o projeto (dev)

```bash
npm run dev
```

Acesse:

```
http://localhost:5173
```

---

## 🎨 Compilar CSS (Tailwind)

Modo desenvolvimento:

```bash
npm run dev:css
```

Build otimizado:

```bash
npm run build:css
```

---

## 🏗️ Build de produção

```bash
npm run build
```

Visualizar build:

```bash
npm run preview
```

---

## 📦 Dependências utilizadas

### Dev:

- vite
- vite-plugin-handlebars
- tailwindcss
- postcss
- autoprefixer
- sharp-cli
- @tailwindcss/forms
- @tailwindcss/typography
- @tailwindcss/aspect-ratio

### Runtime:

- leo-profanity
- profanities

---

## ⚠️ Importante

Este projeto depende de um backend em Google Apps Script.

👉 Veja:

```
/docs/GAS-SETUP.md
```

---

## 📁 Estrutura base

```
src/
 ├── js/
 ├── css/
 ├── assets/
```

---

## ✅ Resumo rápido

```bash
npm install
npm run dev
```

Depois:

- Configurar GAS
- Colar endpoint no projeto

---
