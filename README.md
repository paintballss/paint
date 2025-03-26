# Editor de Imagens

Um editor de imagens baseado na web, desenvolvido com Flask e JavaScript, que permite aos utilizadores carregar, editar e descarregar imagens de forma simples e intuitiva.

## Descrição

Este projeto é um editor de imagens leve e funcional, ideal para quem precisa de uma solução rápida e acessível diretamente no navegador. Entre as funcionalidades disponíveis estão:

- **Carregamento de imagens**: Faça upload de imagens do seu dispositivo.
- **Criação de novas imagens**: Crie imagens em branco com dimensões personalizadas.
- **Desenho e formas**: Utilize ferramentas como lápis, retângulos, círculos e texto.
- **Filtros e ajustes**: Aplique filtros (preto e branco, sépia) e ajuste brilho e contraste.
- **Redimensionamento e rotação**: Altere as dimensões e a orientação da imagem.
- **Desfazer ações**: Reverta alterações com o botão "Desfazer".
- **Download e salvamento**: Descarregue a imagem editada ou guarde-a no servidor.

## Pré-requisitos

Certifique-se de que tem os seguintes requisitos instalados no seu sistema:

- Python 3.6 ou superior
- Pip (gestor de pacotes do Python)

## Instalação

Siga os passos abaixo para instalar e configurar o projeto:

1. Clone o repositório:
   ```bash
   git clone https://github.com/paintballss/paint.git
   ```

2. Navegue até ao diretório do projeto:
   ```bash
   cd seuprojeto
   ```

3. Instale as dependências necessárias:
   ```bash
   pip install -r requirements.txt
   ```

## Como usar

Para iniciar o servidor Flask e utilizar o editor de imagens, execute o seguinte comando:

```bash
python app.py
```

Depois, abra o seu navegador e aceda a `http://127.0.0.1:5000` para começar a editar imagens.

## Funcionalidades

- **Carregar Imagem**: Faça upload de uma imagem do seu dispositivo.
- **Nova Imagem**: Crie uma nova imagem em branco com dimensões personalizadas.
- **Desenho**: Desenhe à mão livre ou adicione formas como retângulos, círculos e texto.
- **Filtros**: Aplique filtros como preto e branco ou sépia.
- **Ajustes**: Ajuste o brilho e o contraste da imagem.
- **Redimensionar e Rodar**: Altere o tamanho ou a orientação da imagem.
- **Desfazer**: Reverta a última ação realizada.
- **Guardar e Descarregar**: Guarde a imagem no servidor ou descarregue-a para o seu dispositivo.

## Estrutura do Projeto

- **`app.py`**: Código principal do servidor Flask.
- **`templates/`**: Contém o ficheiro HTML principal (`index.html`).
- **`static/css/`**: Contém o ficheiro de estilos (`style.css`).
- **`static/js/`**: Contém o ficheiro JavaScript (`script.js`).
- **`temp/`**: Diretório temporário para guardar imagens carregadas e editadas.

## Contribuição

Se quiser contribuir para este projeto, siga os passos abaixo:

1. Faça um fork do repositório.
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-branch
   ```
3. Faça as alterações desejadas e commit:
   ```bash
   git commit -m "Descrição das alterações"
   ```
4. Envie as alterações para o seu fork:
   ```bash
   git push origin minha-branch
   ```
5. Abra um Pull Request no repositório original.

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.

## Autor

Desenvolvido por [Team 404](https://github.com/the-404-team)