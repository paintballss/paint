# Manual Técnico: Editor de Imagens

Este manual descreve o funcionamento interno do sistema, a arquitetura da aplicação, a estrutura do código e como as tecnologias são integradas.

---

## Arquitetura da Aplicação

A aplicação é baseada em uma arquitetura cliente-servidor:

- **Backend**: Desenvolvido com Flask, responsável por gerir as requisições HTTP, processar imagens e servir os ficheiros estáticos.
- **Frontend**: Construído com HTML, CSS e JavaScript, fornece a interface gráfica para o utilizador interagir com o editor.

---

## Estrutura do Código

- **`app.py`**: Código principal do servidor Flask, que define as rotas e a lógica de backend.
- **`templates/`**: Contém o ficheiro HTML principal (`index.html`) que serve como base para o frontend.
- **`static/css/`**: Contém o ficheiro de estilos (`style.css`) para personalizar a interface.
- **`static/js/`**: Contém o ficheiro JavaScript (`script.js`) que implementa a lógica do editor no lado do cliente.
- **`temp/`**: Diretório temporário onde as imagens carregadas e editadas são armazenadas.

---

## Tecnologias Utilizadas

1. **Flask**:
   - Framework web para Python, utilizado para gerir o backend.
   - Responsável por processar imagens e servir os ficheiros estáticos.

2. **HTML/CSS/JavaScript**:
   - HTML: Estrutura da interface do utilizador.
   - CSS: Estilização e layout.
   - JavaScript: Lógica do editor, incluindo desenho no canvas e aplicação de filtros.

3. **Bibliotecas Python**:
   - **Pillow**: Para manipulação de imagens (redimensionamento, filtros, etc.).

---

## Fluxo de Funcionamento

1. O utilizador acede à aplicação através do navegador.
2. O servidor Flask serve o ficheiro HTML principal e os recursos estáticos.
3. O utilizador carrega uma imagem ou cria uma nova no editor.
4. As ações realizadas no editor (desenho, filtros, etc.) são processadas no lado do cliente com JavaScript.
5. Quando o utilizador guarda ou descarrega a imagem, o backend processa a imagem final e a disponibiliza.

---

## Como Contribuir

1. Clone o repositório:
   ```bash
   git clone https://github.com/paintballss/paint.git
   ```

2. Navegue até ao diretório do projeto:
   ```bash
   cd paint
   ```

3. Crie uma nova branch para as suas alterações:
   ```bash
   git checkout -b minha-branch
   ```

4. Faça as alterações e teste o sistema localmente.

5. Envie as alterações para o seu fork e abra um Pull Request.

---

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.