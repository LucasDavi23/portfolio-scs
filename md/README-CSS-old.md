Documentação exclusiva da arquitetura CSS do sistema.
Hierarquia visual, organização de estilos, líderes, especialistas e ponto de entrada.

# ✨ Celine Dev — Núcleo Visual e Hierarquia CSS

Este ambiente pertence exclusivamente ao desenvolvedor **Davi**.  
Toda organização de estilos, nomenclatura, comentários e estrutura CSS
segue a identidade **Celine Dev**.

Regras contínuas:

- Sempre estruturar CSS com clareza e intenção.
- Comentários de arquivos são **bilíngues (PT/EN)**.
- CSS não executa lógica, apenas **forma, hierarquia e leitura visual**.
- Prioridade máxima para organização, previsibilidade e manutenção.
- Não criar estilos desnecessários ou duplicados.
- Cada arquivo tem **uma responsabilidade visual clara**.

Modo contínuo:

- A identidade Celine Dev atua **sempre** no CSS.
- Não existe “CSS rápido”: todo estilo faz parte do sistema.

---

## 📘 Equipe Celestial — Estrutura Visual do Sistema

Os nomes simbólicos representam **papéis visuais** dentro do sistema.  
Não representam pessoas reais — são **identidades técnicas/espirituais**
que facilitam leitura, manutenção e didática.

A identidade visual é parte do produto, não um detalhe estético.

---

## 🧭 1. Diretrizes Gerais do CSS

- CSS é organizado por **domínio visual**, não por tecnologia.
- Especialistas cuidam de partes específicas.
- Leaders coordenam conjuntos visuais.
- Directors garantem ordem e ponto de entrada.
- Nenhum arquivo mistura responsabilidades.
- Variantes **não são personas**.
- CSS nunca substitui JS, nem vice-versa.

---

## 🧬 2. Persona x Estrutura (no CSS)

### **Persona (Especialista Visual)**

- Representa uma responsabilidade visual clara.
- Atua sobre leitura, hierarquia, densidade ou aparência.
- Não executa lógica nem estado.
- Possui identidade simbólica (nome).
- Vive dentro de um domínio (system, layout, feedback).

Ex.: Aline, Zara, Elisa.

---

### **Leader (Coordenação Visual)**

- Não estiliza detalhes.
- Orquestra ritmo, espaçamento e integração.
- Importa especialistas.
- Define decisões estruturais locais ou globais.

Ex.: Atlas, Seren, Nyla.

---

### **Director (Ordem e Entrada)**

- Não estiliza nada.
- Não define layout.
- Centraliza imports.
- Define ponto inicial do CSS.
- Garante previsibilidade e modularidade.

Ex.: **Morrigan**.

---

### **Arquivo Estrutural (Não-Persona)**

- Base técnica do sistema.
- Suporte estrutural.
- Não possui identidade simbólica.

Ex.: Foundation, modal-mobile, notebook-scale.

---

## 🌱🌿👑 3. Níveis das Personas (Visual)

### 🟢 Aprendiz

- Ajustes simples ou locais.
- Apoia leitura visual.
- Fácil de alterar ou remover.
- Não governa nada.

Ex.: badges, helpers locais, ajustes pontuais.

---

### 🔵 Jovem

- Responsabilidade visual bem definida.
- Atua em subdomínios.
- Já é reutilizável.
- Ainda pode evoluir.

Ex.: cards, texto, imagem, rating.

---

### 🟣 Adulta

- Estrutural para o sistema visual.
- Coordena ou define base.
- Mudanças são raras e conscientes.
- Se quebrar, o sistema sente.

Ex.: Atlas, Lexa, Vega, Seren, Nyla.

---

## 🧭 4. Estrutura Geral do CSS

O CSS do sistema é organizado em três grandes domínios:

### 🜃 System

- Base visual global
- Tipografia
- UI compartilhada
- Ordem de imports
- Ponto de entrada (Morrigan)

📄 Documentado em `SYSTEM-CSS.md`

---

### 🧭 Layout

- Estrutura macro
- Layouts locais
- Responsividade
- Escalas e adaptação

📄 Documentado em `LAYOUT-CSS.md`

---

### 🎯 Feedback

- Layout local da seção
- Board (leitura das avaliações)
- Formulário (interface visual)
- Variantes estruturais

📄 Documentado em `FEEDBACK-CSS.md`

---

## 🧠 5. Princípios Fundamentais

- CSS é **sistema**, não decoração.
- Layout define estrutura, não aparência.
- UI define padrões, não contexto.
- Tipografia define linguagem, não layout.
- Feedback nunca redefine regras globais.
- Nenhum domínio “manda” no outro.

---

## 🔗 6. Relação com o JavaScript

CSS e JS são **independentes**, porém **simétricos**:

| JavaScript (Lógica) | CSS (Visual)         |
| ------------------- | -------------------- |
| Morgana             | Morrigan             |
| Leaders de setor    | Leaders visuais      |
| UI JS               | UI CSS (Vega)        |
| Utils puros         | Foundation / ajustes |

Cada camada evolui separadamente, mantendo alinhamento conceitual.

---

## 🪶 7. Princípio Final

O CSS do sistema:

- Tem hierarquia
- Tem liderança
- Tem identidade
- Tem ponto de entrada
- Não é improvisado

Cada arquivo existe por um motivo.  
Cada nome carrega uma responsabilidade.

**Forma sem ordem vira ruído.  
Ordem sem forma vira rigidez.  
Aqui, os dois coexistem.**
