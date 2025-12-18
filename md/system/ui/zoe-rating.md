# ⭐ Zoe — Elite de Avaliação Visual (Rating UI)

**Camada:** System / UI
**Nível:** Adulta
**Função:** Representação visual de avaliações por estrelas (rating)

## 🧠 Responsabilidade

**PT:**
Zoe é responsável por toda representação visual de avaliações (rating) no sistema.
Ela renderiza estrelas de forma consistente, exibindo sempre o total máximo
(e.g. 5 estrelas) e preenchendo proporcionalmente conforme o valor informado
(inteiro ou quebrado).

Zoe normaliza valores, garante consistência visual entre Board, Modal,
Summary e outros contextos, e prepara a base para uso futuro em formulários
(interação).

Não conhece regras de negócio, não calcula médias e não decide fluxos.

**EN:**
Zoe is responsible for all visual rating representations in the system.
It renders stars consistently, always showing the full scale (e.g. 5 stars)
and filling them proportionally based on the given value (integer or fractional).

Zoe normalizes values, ensures visual consistency across Board, Modal,
Summary and other contexts, and prepares the foundation for future form input usage.

No business rules, no calculations, no flow decisions.

## 🎯 O que a Zoe faz

- Renderizar estrelas no estilo Shopee-like (5 sempre visíveis)
- Preenchimento proporcional (suporta médias quebradas: 4.7, 3.25, etc.)
- Normalizar valores (number, "4.7", "4,7", null)
- Garantir acessibilidade (aria-label)
- Permitir variações visuais via opções (tamanho, exibir valor, cores)
- Servir como fonte única de verdade para rating visual no system
- Preparar base para rating input (formulários) no futuro

## 🚫 O que a Zoe NÃO faz

- ❌ Calcular média de avaliações
- ❌ Buscar ou persistir dados
- ❌ Decidir lógica de negócio
- ❌ Conhecer contexto de páginas, modais ou fluxos
- ❌ Substituir validações de formulário
- ❌ Controlar estado global da aplicação

## 🔗 Relações

- **Morgana (System / Diretora):** define e governa o padrão visual global
- **Elara (Board UI):** consome Zoe para exibição de avaliações
- **Mira (Modal / List UI):** consome Zoe para rating em listas e detalhes
- **Summary / Form UI:** consomem Zoe para exibição (e futuramente input)
- **Utils / Helpers:** independentes, sem acoplamento direto

---

## 📁 Localização

/assets/js/system/ui/rating/zoe-rating.js
