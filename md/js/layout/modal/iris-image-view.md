### 👁️ Iris — Image Viewer Modal

**Nível / Level:** Adulto / Adult

**PT:**  
Iris controla o **modal de visualização ampliada de imagens** dentro do layout.

Ela detecta cliques em elementos `.js-open-modal`, identifica a imagem correta e exibe o conteúdo em um modal centralizado.

Responsabilidades:

- abrir o modal com a **imagem selecionada**
- centralizar a visualização em **qualquer tamanho de tela**
- **bloquear o scroll de fundo** enquanto o modal estiver ativo
- fechar o modal ao clicar fora, no botão **“X”** ou pressionar **ESC**
- suportar diferentes origens de imagem (`data-full`, `<img>` ou botões)

Iris não realiza carregamento avançado nem redimensionamento dinâmico —  
seu papel é **exibir imagens de forma limpa, previsível e elegante**.

---

**EN:**  
Iris controls the **modal used for enlarged image viewing** within the layout.

She detects clicks on `.js-open-modal` elements, identifies the correct image source and displays it in a centered modal.

Responsibilities:

- open the modal with the **selected image**
- center the viewer on **any screen size**
- **lock background scroll** while the modal is active
- close the modal when clicking outside, pressing **“X”**, or using **ESC**
- support multiple image sources (`data-full`, `<img>`, or trigger buttons)

Iris does not handle advanced loading or dynamic resizing —  
her role is to **display images in a clean, predictable and elegant way**.
