# 📘 Arquitetura CSS

Este documento apresenta a **filosofia e organização da arquitetura CSS** do sistema.

O projeto adota uma estrutura **modular orientada por especialistas visuais**, onde cada domínio possui responsabilidades claras, líderes definidos e uma hierarquia de estilos previsível.

A arquitetura CSS foi pensada para manter:

- clareza visual
- modularidade
- manutenção simples
- consistência entre setores
- escalabilidade da interface

Toda a organização visual segue a identidade **Celine Dev**, aplicada como base conceitual para nomes, responsabilidades e estrutura dos estilos.

---

# ✨ Celine Dev — Núcleo Visual e Hierarquia CSS

A arquitetura CSS do sistema entende o estilo como parte da estrutura do produto.

Aqui, o CSS não é tratado como complemento improvisado, mas como uma camada organizada de leitura, hierarquia, aparência e consistência visual.

Cada arquivo existe para cumprir uma responsabilidade específica dentro da interface.

---

# 🧭 Diretrizes Gerais do CSS

- CSS é organizado por **domínio visual**, não por tecnologia.
- Especialistas cuidam de partes específicas da interface.
- Leaders coordenam conjuntos visuais.
- Directors garantem ordem, entrada e previsibilidade.
- Nenhum arquivo mistura responsabilidades.
- Variantes **não são personas**.
- CSS não substitui JavaScript, nem JavaScript substitui CSS.

---

# 🧬 Persona x Estrutura

## Persona (Especialista Visual)

Uma persona representa uma responsabilidade visual clara dentro do sistema.

Ela:

- atua sobre leitura, hierarquia, densidade ou aparência
- não executa lógica
- possui identidade simbólica
- vive dentro de um domínio específico

Exemplos:

- Aline
- Zara
- Elisa

---

## Leader (Coordenação Visual)

A leader coordena um conjunto visual.

Ela:

- não estiliza detalhes isolados
- organiza ritmo, integração e coerência do setor
- importa especialistas
- define decisões estruturais locais

Exemplos:

- Atlas
- Seren
- Nyla

---

## Director (Ordem e Entrada)

A director atua na camada de organização da arquitetura.

Ela:

- não estiliza componentes
- não define layout local
- centraliza imports
- define o ponto de entrada
- garante previsibilidade e modularidade

Exemplo:

- **Morrigan**

---

## Arquivo Estrutural (Não-Persona)

Arquivos estruturais oferecem suporte técnico ao sistema visual, sem identidade simbólica.

Exemplos:

- Foundation
- modal-mobile
- notebook-scale

---

# 🌱 Níveis das Personas (Visual)

## 🟢 Aprendiz

Responsável por ajustes simples ou locais.

Características:

- apoio visual pontual
- fácil de alterar ou remover
- não governa o sistema

---

## 🔵 Jovem

Responsabilidade visual bem definida dentro de um subdomínio.

Características:

- já é reutilizável
- atua em partes específicas da interface
- ainda pode evoluir

---

## 🟣 Adulta

Especialista estrutural do sistema visual.

Características:

- coordena ou define base
- mudanças são raras e conscientes
- se quebrar, a interface sente

---

# 🧭 Domínios da Arquitetura CSS

A arquitetura CSS do sistema é organizada em três grandes domínios:

## 🜃 System

Responsável por:

- base visual global
- tipografia
- UI compartilhada
- ordem de imports
- ponto de entrada

📄 Documentado em `system-css.md`

---

## 🧭 Layout

Responsável por:

- estrutura macro
- layouts locais
- responsividade
- escalas e adaptação

📄 Documentado em `layout-css.md`

---

## 🎯 Feedback

Responsável por:

- layout local da seção
- board de avaliações
- formulário
- variantes estruturais

📄 Documentado em `feedback-css.md`

---

# 🧠 Princípios Fundamentais

- CSS é **sistema**, não decoração.
- Layout define estrutura, não aparência.
- UI define padrões, não contexto.
- Tipografia define linguagem, não layout.
- Feedback não redefine regras globais.
- Nenhum domínio governa o outro fora de sua responsabilidade.

---

# 🔗 Relação com o JavaScript

CSS e JavaScript são camadas independentes, porém conceitualmente simétricas.

| JavaScript (Lógica) | CSS (Visual)         |
| ------------------- | -------------------- |
| Morgana             | Morrigan             |
| Leaders de setor    | Leaders visuais      |
| UI JS               | UI CSS               |
| Utils puros         | Foundation / ajustes |

Cada camada evolui de forma separada, mantendo alinhamento conceitual entre lógica e interface.

---

# 🪶 Princípio Final

O CSS do sistema possui:

- hierarquia
- liderança
- identidade
- ponto de entrada
- organização consciente

Cada arquivo existe por um motivo.  
Cada nome carrega uma responsabilidade.

A forma visual não é improvisada: ela faz parte da arquitetura do produto.
