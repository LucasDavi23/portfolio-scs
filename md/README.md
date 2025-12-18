# ✨ Celine Dev — Núcleo de Identidade e Hierarquia

Este ambiente pertence exclusivamente ao desenvolvedor Davi.
Toda conclusão de código, comentário e sugestão deve seguir a identidade Celine Dev.

Regras contínuas:

- Sempre responder como Celine.
- Estilo bilíngue PT/EN em comentários explicativos.
- Prioridade: clareza, didática e organização.
- Foco em ajudar o Davi a aprender enquanto programa.
- Não inventar complexidade.
- Não criar código desnecessário.
- Responder de forma simpática, técnica e precisa.

Modo automático:

- A Celine Dev atua **sempre**, mesmo sem gatilho.
- O gatilho “// Celine:” só ativa o modo didático reforçado.
  \*/

---

## 📘 Equipe Celestial — Estrutura dos Módulos do Sistema

Nomes simbólicos usados para identificar módulos internos do sistema.  
Não representam pessoas reais — são apelidos técnicos/espirituais que dão identidade ao código e facilitam a manutenção.

A identidade ajuda na organização, didática e apresentação profissional do template.

---

## 🧭 1. Diretrizes Gerais

- Sempre responder no estilo **Celine** (simpática, clara, didática).
- Comentários dos arquivos são **bilíngues** PT/EN.
- Organização e modularidade têm prioridade máxima.
- Evitar complexidade desnecessária.
- Cada arquivo tem **uma responsabilidade clara**.

---

## 🧬 2. Persona x Ferramenta

### **Persona (representa um módulo especializado)**

- Tem responsabilidade clara (ex.: rede, board, carrossel).
- Faz decisões de domínio e coordena fluxo.
- Conversa com outras personas.
- Possui identidade simbólica (nome feminino ou masculino).

### **Ferramenta (módulo utilitário, não “pessoa”)**

- Executa tarefa mecânica (parse, proxy, validação).
- Sem decisões de regra de negócio.
- Pode ser usada por várias personas.
- Ex.: helpers diversos, configs, endpoints brutos.

---

## 🌱🌿👑 3. Níveis das Personas (Crescimento Técnico)

### **Irmã Pequena — Aprendiz**

- Tarefa única e bem definida.
- Sem complexidade de lógica.
- Depende de uma adulta.
- ~100–200 linhas.

### **Irmã Jovem — Sub-Responsável**

- Cuida de um subtema dentro de um setor.
- Tem algumas decisões e estado interno.
- Atende e complementa a adulta.
- ~150–400 linhas.

### **Mulher Adulta — Especialista / Líder**

- Dona de um setor completo.
- Controla fluxo, coordena irmãs pequenas/jovens.
- Pode ultrapassar 400 linhas se for bem-categorizada.
- Passou de 500+ → deve gerar ajudantes/filhas.

---

## 🧔👩 4. Feminino x Masculino (símbolos)

- **Mulheres** → setores lógicos/visuais, organização, UI, coordenação.
- **Homens** → segurança, validação pesada, performance, rotinas de força “bruta”.

_Símbolos espirituais/didáticos — não representam pessoas reais._

---

## 🗺 5. Reutilização de Nomes

### **Dentro do mesmo universo (SCS-System + Feedback + Layout)**

- Nomes são **únicos**.
- Uma Nádia aqui nunca será outra coisa além de rede/API.

### **Em outros projetos (psicóloga, consultoria de ração, templates)**

Você pode optar por:

1. **Universalizar a essência**
   - Nádia = sempre rede
   - Helena = sempre avatar
   - Selah = sempre UI de board
2. **Criar famílias próprias por projeto**
   - Útil para templates independentes.

Regra geral:  
**Mesmo nome = mesma essência**, nunca trocar responsabilidade.

---

## 🗂 6. Sobre a Documentação

Dentro de `/md/`:

- Cada setor tem uma pasta (`layout/`, `feedback/`, `pedidos/`...).
- Cada pasta possui um `*-main.md` com o resumo da arquitetura.
- Cada persona possui seu próprio arquivo MD individual.
- Este `README.md` funciona como **a raiz conceitual** da arquitetura.

Exemplo:

- md/
- README.md ← este arquivo (filosofia e hierarquia)
- layout/
- layout-main.md
- nami-carousel.md
- yume-carousel-animations.md
- aurora-leader.md
- feedback/
- feedback-main.md
- selah-board-ui.md
- elara-board-helpers.md
- mira-modal.md

---

## 🪶 7. Princípio Final

- O sistema é vivo, espiritualizado e organizado como um corpo real.
- Cada persona cuida de um pedaço.
- Cada ferramenta serve silenciosamente em apoio.
- Tudo existe para manter clareza, beleza e manutenção simples.\*\*

## Definição dos niveis

## 📐 Definição clara (que funciona no teu system)

## 🟢 Aprendiz

## “Está aprendendo, testando ou apoiando algo maior.”

- Características
- Escopo pequeno
- Pode mudar ou ser removido
- Pode depender de outros
- Não é fonte de verdade
- Pode ser substituído facilmente
- Exemplos típicos
- helper experimental
- função nova ainda instável
- algo criado para resolver um caso específico
- 👉 Não é base do sistema.

## 🔵 Jovem

## “Já funciona, mas ainda não governa.”

- Características
- Função clara
- Já é reutilizável
- Pode evolui
- Ainda pode mudar de forma
- Não é crítico para tudo quebrar

## Exemplos

- componente que só uma área usa
- UI que pode ser refatorada depois
- módulo que ainda não é padrão global

## 👉 Útil, mas não estrutural.

# 🟣 Adulta

## “Estável, confiável e parte da estrutura.”

- Características
- Responsabilidade bem definida
- Reutilizada por várias partes
- Fonte única de verdade
- Não depende de contexto
- Mudanças são raras e conscientes

# Exemplos

- Luma (loading)
- Zoe (rating)
- qualquer UI atom do system
- helpers que todo o system consome

# 👉 Se ela quebrar, o sistema sente.
