# ☁️ Google Apps Script Setup

## Overview

This project uses Google Apps Script as the backend for:

- Sending feedback
- Listing reviews
- Image uploads

---

## 🧩 Step 1 — Create a GAS Project

Go to:

https://script.google.com

Click on:

- "New project"

---

## 📄 Step 2 — Add the API Code

Inside the created project:

1. Remove the default generated code
2. Create a new file (example: `GAS.js`)
3. Paste the API code provided in the project

---

## 💾 Step 3 — Save

Give your project a name and save it.

---

## 🚀 Step 4 — Deploy as Web App

1. Click on **Deploy**
2. Click on **New deployment**
3. Select type: **Web App**

Configuration:

- Execute as: **You**
- Who has access: **Anyone**

---

## 🔗 Step 5 — Copy the URL

After deploying, copy the URL generated in the **Web App** section.

This will be your API URL.

Example:

https://script.google.com/macros/s/YOUR_ID/exec

---

### ⚠️ Important

- Use only the **Web App URL**
- Do not use library URLs or editor links

---

## 🧪 Quick API Test

After copying the URL, you can test it by opening it directly in your browser.

If everything is correct, the API should respond without errors.

---

### ⚠️ If it doesn’t work

- Make sure it was deployed as a **Web App**
- Check access permissions
- Confirm the URL ends with `/exec`

---

## 🔧 Step 6 — Configure in the Project

In the frontend, locate the endpoint configuration:

```js
const GAS_ENDPOINT = 'YOUR_GAS_URL_HERE';
```

Replace it with your Google Apps Script URL.

---

## 🔁 Updating the API (Important)

Whenever you update your Google Apps Script code:

1. Click **Deploy**
2. Click **Manage deployments**
3. Select the active deployment
4. Click the edit icon (✏️)
5. Select the latest version
6. Click **Update**

---

### ⚠️ Important

- Do not use **"New deployment"** for updates
- This will generate a new URL and may break the integration
- Always update the existing deployment to keep the same API URL

---

## ⚠️ Notes

- Without GAS, the system will work only partially
- Feedback submission and retrieval depend on the API
- If the API URL changes, it must be updated in the frontend
