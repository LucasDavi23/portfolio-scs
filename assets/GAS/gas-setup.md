# ☁️ Google Apps Script Setup

## Visão geral

Este projeto utiliza o Google Apps Script como backend para:

- envio de feedback
- listagem de avaliações
- upload de imagens
- leitura e normalização de imagens do Google Drive

---

## 🧩 Passo 1 — Criar projeto no GAS

Acesse:

https://script.google.com

Clique em:

- **Novo projeto**

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

## 📊 Passo 4 — Criar e configurar a planilha

Crie uma nova planilha no Google Sheets.

Depois, configure as abas esperadas pelo sistema.

### Aba pública de avaliações

Nome da aba:

```
Reviews
```

Cabeçalhos esperados:

```
platform | approved | date | author | text | rating | url
```

---

### Aba privada de respostas

Nome da aba:

```
Responses
```

Essa aba será usada para armazenar os envios do formulário.

---

## 🔗 Passo 5 — Copiar o ID da planilha

Abra a planilha no navegador.

Exemplo de URL:

```
https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
```

O ID da planilha é a parte entre:

```
/d/ e /edit
```

Exemplo:

```js
const SPREADSHEET_ID = 'SEU_ID_AQUI';
```

Cole esse ID no código do Apps Script:

```js
const SPREADSHEET_ID = 'SEU_ID_AQUI';
```

---

### ⚠️ Importante

Se o `SPREADSHEET_ID` estiver incorreto:

- a API pode puxar dados antigos
- a API pode retornar vazio
- o formulário pode salvar no lugar errado

---

## 🖼️ Passo 6 — Ativar o Google Drive (Obrigatório)

Este projeto utiliza imagens armazenadas no Google Drive.

Além do `DriveApp`, o código também utiliza recursos avançados como:

- `Drive.Files.get(...)`
- `Drive.Permissions.create(...)`

Por isso, é necessário ativar o serviço avançado do Google Drive.

### Como ativar

1. No projeto do Apps Script, clique em **Serviços**
2. Clique em **Adicionar serviço**
3. Procure por **Drive API**
4. Adicione o serviço

---

### ⚠️ Importante

Sem essa configuração:

- o upload de imagens pode falhar
- o proxy de imagem pode falhar
- links de imagem podem não funcionar corretamente
- `resourceKey` pode não ser resolvido

---

## 🚀 Passo 7 — Implantar como Web App

1. Clique em **Implantar**
2. Clique em **Nova implantação**
3. Tipo: **Aplicativo da Web**

Configuração:

- Executar como: **Você**
- Acesso: **Qualquer pessoa**

---

## 🔗 Passo 8 — Copiar URL

Após implantar, copie a URL gerada na seção **Aplicativo da Web**.

Essa será a URL da sua API.

Exemplo:

```
https://script.google.com/macros/s/SEU_ID/exec
```

---

### ⚠️ Atenção

- Utilize apenas a URL do **Aplicativo da Web**
- Não utilize URLs do editor ou biblioteca

---

## 🧪 Passo 9 — Teste rápido da API

Abra no navegador:

```
https://script.google.com/macros/s/SEU_ID/exec?mode=list
```

Se estiver correto, retornará um JSON.

---

## ⚠️ Se não funcionar

Verifique:

- implantação como **Aplicativo da Web**
- acesso como **Qualquer pessoa**
- URL correta (`/exec`)
- `SPREADSHEET_ID` correto
- Drive API ativado

---

## 🔧 Passo 10 — Configurar no frontend

No frontend, localize:

```js
const GAS_ENDPOINT = 'SUA_URL_DO_GAS_AQUI';
```

Substitua pela URL do seu Apps Script.

---

## 🔁 Atualizar o código da API (Importante)

Sempre que alterar o GAS:

1. Clique em **Implantar**
2. Clique em **Gerenciar implantações**
3. Edite a implantação atual
4. Selecione a nova versão
5. Clique em **Atualizar**

---

### ⚠️ Importante

- NÃO use “Nova implantação” para atualizar
- Isso gera uma nova URL
- Sempre atualize a implantação existente

---

## ⚠️ Observações finais

- sem o GAS, o sistema funciona parcialmente
- feedback e mural dependem da API
- imagens dependem do Google Drive corretamente configurado
- alterações na URL exigem atualização no frontend

---

## 🧩 Problemas comuns

### ❌ Dados não atualizam

- verifique o `SPREADSHEET_ID`
- verifique se fez deploy novo

---

### ❌ "Invalid mode/action"

- código do GAS incompleto
- endpoint incorreto

---

### ❌ Imagens não carregam

- Drive API não ativado
- imagem não está pública
- link não está normalizado

---

### ❌ Ainda mostra dados antigos

- cache do navegador
- cache interno (≈60 segundos)

---
