### 🌿 Elis — Feedback Create Action (Gateway)

**Nível / Level:** Jovem / Young

**PT:**  
Camada de gateway responsável pela criação de feedback no **Form**.

Funções:

- receber o **payload já preparado**
- encaminhar a requisição ao Apps Script via **Vesper**
- executar a action `"submitFeedbackAction"`
- devolver a **resposta técnica normalizada**

Elis não executa validações nem decisões de negócio.

**EN:**  
Gateway layer responsible for feedback creation in the **Form**.

Responsibilities:

- receive the **ready payload**
- forward the request to Apps Script via **Vesper**
- execute the `"submitFeedbackAction"` action
- return the **normalized technical response**

Elis performs no validation or business decisions.
