# ☁️ Google Apps Script Setup

## Visão geral

Este projeto utiliza o Google Apps Script como backend para:

- Envio de feedback
- Listagem de avaliações
- Upload de imagens

---

## 🧩 Passo 1 — Criar projeto no GAS

Acesse:

https://script.google.com

Clique em:

- "Novo projeto"

---

## 📄 Passo 2 — Adicionar o código

No projeto criado:

1. Apague o código padrão gerado automaticamente
2. Crie um novo arquivo (exemplo: `GAS.js`)
3. Cole o código da API fornecido no projeto

---

## 💾 Passo 3 — Salvar

Dê um nome ao projeto e salve.

---

## 🚀 Passo 4 — Implantar como Web App

1. Clique em **Implantar**
2. Clique em **Nova implantação**
3. Tipo: **Aplicativo da Web**

Configuração:

- Executar como: **Você**
- Acesso: **Qualquer pessoa**

---

## 🔗 Passo 5 — Copiar URL

Após implantar, copie a URL gerada na seção **Aplicativo da Web**.

Essa será a URL da sua API.

Exemplo de URL:

https://script.google.com/macros/s/SEU_ID/exec

---

### ⚠️ Atenção

- Utilize apenas a URL do **Aplicativo da Web**
- Não utilize URLs de biblioteca ou do editor do Google Apps Script

---

## 🧪 Teste rápido da API

Após copiar a URL, você pode testá-la abrindo diretamente no navegador.

Se estiver tudo correto, a API deve responder sem erro.

---

### ⚠️ Se não funcionar

- Verifique se a implantação foi feita como **Aplicativo da Web**
- Verifique as permissões de acesso
- Confirme se está usando a URL correta (terminada em `/exec`)

---

## 🔧 Passo 6 — Configurar no projeto

No frontend, localize a constante de configuração do endpoint:

```js
const GAS_ENDPOINT = 'SUA_URL_DO_GAS_AQUI';
```

Substitua esse valor pela URL gerada no Google Apps Script.

---

## 🔁 Atualizar o código da API (Importante)

Sempre que fizer alterações no Google Apps Script:

1. Clique em **Implantar**
2. Clique em **Gerenciar implantações**
3. Selecione a implantação ativa
4. Clique no ícone de edição (✏️)
5. Selecione a versão mais recente
6. Clique em **Atualizar**

---

### ⚠️ Importante

- Não utilize **"Nova implantação"** para atualizar o sistema
- Isso criará uma nova URL e poderá quebrar a integração com o frontend
- Sempre atualize a implantação existente para manter a mesma API

---

## ⚠️ Observações

- Sem o GAS, o sistema funciona apenas parcialmente
- O envio e leitura de feedback dependem da API
- Se a URL da API mudar, será necessário atualizá-la manualmente no frontend
