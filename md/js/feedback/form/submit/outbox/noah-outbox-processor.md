### 🧱 Noah — Outbox Processor

**Nível / Level:** Adulto / Adult

**PT:**  
Especialista em **entrega eventual de envios pendentes**.

Responsabilidades:

- consultar a **Outbox mantida por Alma**
- decidir **quando tentar novamente**
- executar **reenvios com retry e backoff**
- remover itens da fila após envio bem-sucedido

Noah não armazena dados (responsabilidade da **Alma**),  
não coordena o fluxo de submit do formulário,  
não valida regras de domínio e não manipula UI.

**EN:**  
Specialist in **eventual delivery of pending submissions**.

Responsibilities:

- query the **Outbox maintained by Alma**
- decide **when to retry**
- perform **resends using retry and backoff**
- remove items from the queue after successful delivery

Noah does not store data (handled by **Alma**),  
does not coordinate the form submit flow,  
does not validate domain rules and does not manipulate UI.
