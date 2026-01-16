### 🎠 Nami — Carrossel Principal do Layout

**Arquivo:** `nami-carousel-layout.js`

**PT:**  
Nami controla o carrossel principal da página, gerenciando transições, setas, dots e interações por toque.  
Ela cuida de todo o fluxo visual, garantindo movimentos suaves e limites bem definidos entre os slides.

Suas responsabilidades incluem:

- Definir o estado inicial do carrossel
- Controlar o slide atual e o slide alvo
- Gerenciar botões (próximo / anterior) mesmo quando desabilitados
- Atualizar visualmente os indicadores (dots)
- Aplicar transições suaves entre slides
- Tratar navegação por swipe (mobile) com detecção de velocidade
- Impedir animações simultâneas (lock interno)

Nami não cuida de animações avançadas (isso será tarefa da Yume no futuro).  
Ela trabalha exclusivamente no **controle lógico e visual** do carrossel, garantindo consistência e fluidez.

**EN:**  
Nami manages the page’s main carousel, handling transitions, arrows, dots and touch interactions.  
She controls the entire visual flow, ensuring smooth movements and well-defined slide boundaries.

Her responsibilities include:

- Setting the initial carousel state
- Managing current and target slides
- Handling next/previous buttons (even when disabled)
- Updating visual indicators (dots)
- Applying smooth transition animations
- Detecting swipe gestures with velocity thresholds
- Preventing simultaneous transitions (internal lock)

Nami does not handle advanced animations (this will be Yume’s job in the future).  
She focuses solely on **logical and visual control** of the carousel, ensuring consistency and fluidity.
