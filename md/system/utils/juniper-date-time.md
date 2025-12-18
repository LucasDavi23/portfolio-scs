# 🌿 Juniper — Date / Time Utilities

**Camada:** System / Utils  
**Nível:** Adulta  
**Função:** Manipulação e formatação segura de data e hora

---

## 🧠 Responsabilidade

**PT:**  
Juniper fornece funções **puras** para interpretar, normalizar e formatar
datas e horários no sistema, sempre com _fallback_ seguro.
Não possui DOM, não conhece UI e não depende de contexto visual.

**EN:**  
Juniper provides **pure** utilities to parse, normalize and format
date/time values with safe fallbacks.
No DOM, no UI awareness, no visual context.

---

## 🎯 O que a Juniper faz

- Interpretar datas em formatos variados
- Normalizar valores inválidos ou ausentes
- Formatar data/hora para exibição
- Garantir fallback consistente (evita `Invalid Date`)

---

## 🚫 O que a Juniper NÃO faz

- ❌ Manipular DOM
- ❌ Renderizar UI
- ❌ Fazer fetch
- ❌ Conhecer origem dos dados (API, Modal, Board, etc.)

---

## 🔗 Relações

- **Morgana (System/Core):** expõe Juniper como utilitário global
- **UIs (Mira, Selah, etc.):** consomem Juniper para exibição de datas
- **Helpers de domínio:** podem reutilizar Juniper sem acoplamento

---
