# 📘 Arquitetura do Sistema — Layout

### Governança de Aurora — Direção da Estrutura Visual

O **Layout** controla os comportamentos estruturais da interface da aplicação.

Essa camada organiza elementos essenciais da navegação e interação da página, como menu mobile, modal de imagens e carrossel principal, garantindo consistência visual e fluidez de uso.

A governança de **Aurora** coordena os módulos do layout, inicializando cada componente na ordem correta e mantendo a estrutura da interface estável e modular.

---

# 🧭 Visão Geral dos Setores (Layout)

| Setor        | Responsável | Papel                                        |
| ------------ | ----------- | -------------------------------------------- |
| Fundação     | Luna        | Utilidades básicas do layout                 |
| Navegação    | Navi / Nara | Controle do menu e estado da navegação       |
| Modal        | Iris        | Visualização ampliada de imagens             |
| Modal Motion | Vela        | Padronização das animações de modais         |
| Form Modal   | Lyra        | Controle de modais de formulário             |
| Viewer       | Echo        | Navegação de imagens em galeria              |
| Carrossel    | Nami        | Controle lógico do carrossel                 |
| Scroll       | Aura        | Base para futuros efeitos baseados em scroll |
| Animação     | Yume        | Camada futura de animações do carrossel      |
| Coordenação  | Aurora      | Inicialização e organização do layout        |

---

# 🌸 Personas do Layout

| Persona | Função                           |
| ------- | -------------------------------- |
| Aurora  | Coordenação geral do Layout      |
| Luna    | Foundation do layout             |
| Navi    | Controle da navegação mobile     |
| Nara    | Estado ativo da navegação        |
| Iris    | Modal de imagem                  |
| Echo    | Navegação de imagens no modal    |
| Lyra    | Controle de modais de formulário |
| Vela    | Motion dos modais                |
| Nami    | Carrossel principal              |
| Aura    | Espaço para efeitos de scroll    |
| Yume    | Camada futura de animações       |

# 🌳 Planta do Layout

```

Layout
│
├─ Coordenação
│   └ Aurora
│
├─ Fundação
│   └ Luna
│
├─ Navegação
│   ├ Navi
│   └ Nara
│
├─ Modal
│   ├ Iris
│   ├ Vela
│   └ Echo
│
├─ Form Modal
│   └ Lyra
│
├─ Carrossel
│   ├ Nami
│   └ Yume
│
└─ Scroll
    └ Aura
```
