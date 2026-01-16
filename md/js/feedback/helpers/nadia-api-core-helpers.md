### 🧬 Nádia — Core da API (Rede)

**Arquivo:** `nadia-api-core-helpers.js`

**PT:** Nádia é o núcleo de rede do sistema. Ela fornece: fetchJsonCached() — fetch + timeout + retry + cache + coalesce setTimeoutMs() — configura o timeout
setRetries() — configura tentativas setCacheTtl() — configura TTL do cache Camadas superiores nunca fazem rede direta — elas sempre usam Nádia.

**EN:** Nadia is the core of the system's network. It provides: fetchJsonCached() — fetch + timeout + retry + cache + coalesce setTimeoutMs() — sets the timeout
setRetries() — sets retries setCacheTtl() — sets the cache TTL Upper layers never do direct networking — they always use Nadia.

---
