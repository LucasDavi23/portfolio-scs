### 🧠 Alma — Submit Queue Guardian

**Nível / Level:** Jovem / Young

**PT:**  
Responsável por **armazenar tentativas de envio que falharam** durante o fluxo de submit do formulário.

Responsabilidades:

- manter uma **fila local (queue)** de payloads pendentes
- preservar a **ordem das tentativas de envio**
- garantir **integridade e identidade** de cada payload
- disponibilizar os dados pendentes quando solicitados

Alma não envia dados, não executa retry e não valida regras de domínio.

Ela atua apenas como **armazenamento organizado das tentativas pendentes**.

**EN:**  
Responsible for **storing failed submit attempts** during the form submission flow.

Responsibilities:

- maintain a **local queue of pending payloads**
- preserve the **order of submit attempts**
- ensure **payload integrity and identity**
- provide pending data when requested

Alma does not send data, perform retries, or validate domain rules.

She operates only as an **organized storage layer for pending submissions**.
