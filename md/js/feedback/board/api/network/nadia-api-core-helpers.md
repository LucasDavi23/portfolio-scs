### 🧬 Nádia — Core da API (Rede)

**Nível / Level: Adulto / Adult**

**PT:**  
Nádia é o núcleo de rede do sistema.

Ela centraliza todas as chamadas de API, fornecendo uma camada segura e otimizada para comunicação com serviços externos.

Funções principais:

- **fetchJsonCached()** — fetch com timeout, retry, cache e coalesce
- **setTimeoutMs()** — configura o tempo limite das requisições
- **setRetries()** — define o número de tentativas em caso de falha
- **setCacheTtl()** — configura o tempo de vida do cache

Camadas superiores do sistema **nunca fazem chamadas de rede diretamente** — elas sempre utilizam a Nádia.

---

**EN:**  
Nadia is the system's network core.

She centralizes all API calls, providing a safe and optimized layer for communication with external services.

Main functions:

- **fetchJsonCached()** — fetch with timeout, retry, cache and request coalescing
- **setTimeoutMs()** — sets the request timeout
- **setRetries()** — defines retry attempts
- **setCacheTtl()** — configures cache time-to-live

Upper layers of the system **never perform direct network requests** — they always rely on Nadia.

---
