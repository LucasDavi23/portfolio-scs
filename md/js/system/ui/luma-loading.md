# 🍃 Luma — Soldado de Elite do Loading

**Camada:** System / UI  
**Nível:** Adulta  
**Função:** Estado visual de carregamento (global)

---

## 🧠 Responsabilidade

**PT:**  
Luma é responsável por todo estado visual de _loading_ do sistema.  
Ela renderiza spinners, controla loading em botões e garante que o browser
pinte o estado de carregamento antes de operações pesadas.

Não executa fetch, não valida dados e não conhece fluxos específicos
(Mira, Selah, etc).

**EN:**  
Luma handles all visual loading states across the system.  
It renders spinners, toggles loading on buttons and ensures a paint frame
before heavy operations.

No fetch, no data validation, no feature awareness.

---

## 🎯 O que a Luma faz

- Renderizar spinner + label (Tailwind)
- Controlar loading em botões (`disabled`, `aria-busy`)
- Garantir pintura do loading (`ensurePaint`)
- Evitar `undefined` visual em labels

---

## 🚫 O que a Luma NÃO faz

- ❌ Fetch de dados
- ❌ Validação de resposta
- ❌ Decisão de fluxo
- ❌ Conhecimento de modais ou páginas específicas

---

## 🔗 Relações

- **Morgana (System/Core):** autoriza e define padrões globais
- **Mira / Selah / outras UIs:** consomem Luma para estados de carregamento
- **Helpers (Dara, Juniper):** independentes, não acoplados

---

## 📁 Localização

/asset/js/system/ui/loading/luma-loading.js
