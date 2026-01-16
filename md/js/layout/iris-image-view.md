### 👁️ Iris — Modal de Imagem (Image Viewer)

**Arquivo:** `iris-image-viewer.js`

**PT:**  
Iris controla o modal de visualização de imagens em tamanho ampliado.  
Ela detecta cliques em elementos marcados com `.js-open-modal`, identifica a imagem correspondente e exibe o modal no centro da tela.

Suas responsabilidades incluem:

- Abrir o modal com a imagem selecionada
- Centralizar a visualização mesmo em telas pequenas
- Bloquear o scroll do fundo enquanto a imagem está aberta
- Fechar o modal ao clicar no fundo, no botão “X” ou pressionar ESC
- Reagir corretamente a diferentes origens da imagem (data-full, `<img>`, botões)

Iris não faz carregamento avançado, não redimensiona imagens dinamicamente e não aplica filtros —  
ela foca exclusivamente em exibir a imagem de forma elegante, limpa e previsível.

**EN:**  
Iris manages the modal for enlarged image viewing.  
She detects clicks on `.js-open-modal` elements, identifies the correct image source and displays it in a centered modal.

Her responsibilities include:

- Opening the modal with the selected image
- Centering the viewer even on small screens
- Locking background scroll while active
- Closing the modal when clicking outside, pressing “X”, or using ESC
- Handling multiple image sources (data-full, `<img>`, trigger buttons)

Iris does not handle advanced loading, dynamic resizing, or filters —  
her purpose is to display images in a clean, elegant and predictable manner.
