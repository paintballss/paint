import os
import uuid
from flask import Flask, render_template, request, send_file, session
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageEnhance, ImageFile

# Permite carregar imagens mesmo que estejam truncadas
ImageFile.LOAD_TRUNCATED_IMAGES = True

app = Flask(__name__)
app.secret_key = "chave_secreta"
app.config["UPLOAD_FOLDER"] = "temp"
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # Limite de 5MB

# Garante que a pasta temp exista
if not os.path.exists(app.config["UPLOAD_FOLDER"]):
    os.makedirs(app.config["UPLOAD_FOLDER"])

def get_image():
    """
    Retorna a imagem atual (Pillow Image) baseada no 'img_id' da sessão.
    
    A função verifica se existe um 'img_id' na sessão. Se existir, tenta abrir a imagem correspondente
    no diretório de upload. Caso contrário, retorna None.

    Returns:
        Image: A imagem atual se existir, caso contrário, None.
    """
    if "img_id" not in session:
        return None
    img_path = os.path.join(app.config["UPLOAD_FOLDER"], session["img_id"] + ".png")
    if os.path.exists(img_path):
        try:
            return Image.open(img_path)
        except Exception as e:
            print("Erro ao abrir a imagem:", e)
    return None

def save_image(img):
    """
    Salva a imagem (Pillow Image) na pasta temp e atualiza a sessão.
    
    A função gera um 'img_id' único se não existir na sessão, salva a imagem no diretório de upload
    e atualiza a sessão com o 'img_id'.

    Args:
        img (Image): A imagem a ser salva.
    
    Returns:
        str: O caminho da imagem salva.
    """
    img_id = session.get("img_id", str(uuid.uuid4()))
    session["img_id"] = img_id
    img_path = os.path.join(app.config["UPLOAD_FOLDER"], img_id + ".png")
    img.save(img_path)
    return img_path

@app.route("/")
def index():
    """
    Renderiza a página inicial do editor de imagens.
    
    A função renderiza o template HTML da página inicial.

    Returns:
        str: O conteúdo HTML da página inicial.
    """
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    """
    Carrega uma imagem do dispositivo e a salva como PNG.
    
    A função recebe uma imagem do formulário, converte para RGBA, salva a imagem atual e uma cópia
    da imagem original no diretório de upload.

    Returns:
        Response: A imagem carregada ou uma mensagem de erro.
    """
    file = request.files.get("image")
    if file:
        try:
            img = Image.open(file.stream).convert("RGBA")
            save_image(img)  # Salva a imagem atual
            # Salva uma cópia da imagem original
            img.save(os.path.join(app.config["UPLOAD_FOLDER"], session["img_id"] + "_original.png"))
            return send_image()  # Retorna a imagem carregada diretamente
        except Exception as e:
            return f"Erro ao processar a imagem: {e}", 500
    return "Erro no upload", 400

@app.route("/reset_image", methods=["POST"])
def reset_image():
    """
    Restaura a imagem original salva.
    
    A função substitui a imagem atual pela imagem original salva no diretório de upload.

    Returns:
        Response: A imagem original ou uma mensagem de erro.
    """
    if "img_id" not in session:
        return "Nenhuma imagem carregada", 400
    original_path = os.path.join(app.config["UPLOAD_FOLDER"], session["img_id"] + "_original.png")
    if os.path.exists(original_path):
        # Substitui a imagem atual pela original
        current_path = os.path.join(app.config["UPLOAD_FOLDER"], session["img_id"] + ".png")
        os.replace(original_path, current_path)
        return send_file(current_path, mimetype="image/png")
    return "Imagem original não encontrada", 404

@app.route("/new", methods=["POST"])
def new_image():
    """
    Cria uma nova imagem em branco.
    
    A função cria uma nova imagem em branco com as dimensões especificadas no formulário e salva
    no diretório de upload.

    Returns:
        str: Mensagem de confirmação da criação da nova imagem.
    """
    width = int(request.form.get("width", 800))
    height = int(request.form.get("height", 600))
    img = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    save_image(img)
    return "Nova imagem criada!"

@app.route("/resize", methods=["POST"])
def resize():
    """
    Redimensiona a imagem.
    
    A função redimensiona a imagem atual para as novas dimensões especificadas no formulário.

    Returns:
        Response: A imagem redimensionada ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    new_width = int(request.form.get("width", img.width))
    new_height = int(request.form.get("height", img.height))
    img = img.resize((new_width, new_height), Image.ANTIALIAS)
    save_image(img)
    return send_image()

@app.route("/rotate", methods=["POST"])
def rotate():
    """
    Rotaciona a imagem.
    
    A função rotaciona a imagem atual pelo número de graus especificado no formulário.

    Returns:
        Response: A imagem rotacionada ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    degrees = float(request.form.get("degrees", 0))
    img = img.rotate(degrees, expand=True)
    save_image(img)
    return send_image()

@app.route("/adjust", methods=["POST"])
def adjust():
    """
    Ajusta brilho e contraste da imagem.
    
    A função ajusta o brilho e o contraste da imagem atual com os valores especificados no formulário.

    Returns:
        Response: A imagem ajustada ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    brightness = float(request.form.get("brightness", 1))
    contrast = float(request.form.get("contrast", 1))
    try:
        img = ImageEnhance.Brightness(img).enhance(brightness)
        img = ImageEnhance.Contrast(img).enhance(contrast)
    except Exception as e:
        return f"Erro ao ajustar imagem: {e}", 500
    save_image(img)
    return send_image()

@app.route("/filter", methods=["POST"])
def apply_filter():
    """
    Aplica filtro (grayscale, sepia) à imagem.
    
    A função aplica o filtro especificado no formulário (grayscale ou sepia) à imagem atual.

    Returns:
        Response: A imagem com o filtro aplicado ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    filter_type = request.form.get("type", "")
    try:
        if filter_type == "grayscale":
            img = ImageOps.grayscale(img).convert("RGBA")
        elif filter_type == "sepia":
            sepia = ImageOps.grayscale(img).convert("RGB")
            pixels = sepia.load()
            for y in range(sepia.size[1]):
                for x in range(sepia.size[0]):
                    r, g, b = pixels[x, y]
                    tr = int(0.393*r + 0.769*g + 0.189*b)
                    tg = int(0.349*r + 0.686*g + 0.168*b)
                    tb = int(0.272*r + 0.534*g + 0.131*b)
                    pixels[x, y] = (min(tr,255), min(tg,255), min(tb,255))
            img = sepia.convert("RGBA")
    except Exception as e:
        return f"Erro ao aplicar filtro: {e}", 500
    save_image(img)
    return send_image()

@app.route("/add_text", methods=["POST"])
def add_text():
    """
    Adiciona texto à imagem.
    
    A função adiciona o texto especificado no formulário à imagem atual nas coordenadas especificadas.

    Returns:
        Response: A imagem com o texto adicionado ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    text = request.form.get("text", "")
    x = int(request.form.get("x", 10))
    y = int(request.form.get("y", 10))
    size = int(request.form.get("size", 20))
    color = request.form.get("color", "#000000")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("arial.ttf", size)
    except:
        font = ImageFont.load_default()
    draw.text((x, y), text, fill=color, font=font)
    save_image(img)
    return send_image()

@app.route("/add_shape", methods=["POST"])
def add_shape():
    """
    Desenha linha, círculo ou retângulo na imagem.
    
    A função desenha a forma especificada no formulário (linha, círculo ou retângulo) na imagem atual
    com as coordenadas e dimensões especificadas.

    Returns:
        Response: A imagem com a forma desenhada ou uma mensagem de erro.
    """
    img = get_image()
    if not img:
        return "Nenhuma imagem carregada", 400
    shape_type = request.form.get("shape_type", "line")
    color = request.form.get("color", "#000000")
    width = int(request.form.get("width", 3))
    draw = ImageDraw.Draw(img)
    try:
        if shape_type == "line":
            x1 = int(request.form.get("x1", 0))
            y1 = int(request.form.get("y1", 0))
            x2 = int(request.form.get("x2", 100))
            y2 = int(request.form.get("y2", 100))
            draw.line((x1, y1, x2, y2), fill=color, width=width)
        elif shape_type == "circle":
            x = int(request.form.get("x", 50))
            y = int(request.form.get("y", 50))
            r = int(request.form.get("radius", 30))
            draw.ellipse((x-r, y-r, x+r, y+r), outline=color, width=width)
        elif shape_type == "rectangle":
            x1 = int(request.form.get("x1", 0))
            y1 = int(request.form.get("y1", 0))
            x2 = int(request.form.get("x2", 100))
            y2 = int(request.form.get("y2", 100))
            draw.rectangle((x1, y1, x2, y2), outline=color, width=width)
    except Exception as e:
        return f"Erro ao desenhar forma: {e}", 500
    save_image(img)
    return send_image()

@app.route("/image")
def get_current_image():
    """
    Retorna a imagem atual.
    
    A função retorna a imagem atual salva no diretório de upload.

    Returns:
        Response: A imagem atual ou uma mensagem de erro.
    """
    img_path = os.path.join(app.config["UPLOAD_FOLDER"], session.get("img_id", "") + ".png")
    if os.path.exists(img_path):
        return send_file(img_path, mimetype="image/png")
    return "Nenhuma imagem encontrada", 404

@app.route("/download")
def download():
    """
    Baixa a imagem atual.
    
    A função permite o download da imagem atual salva no diretório de upload.

    Returns:
        Response: A imagem atual para download ou uma mensagem de erro.
    """
    img_path = os.path.join(app.config["UPLOAD_FOLDER"], session.get("img_id", "") + ".png")
    if os.path.exists(img_path):
        return send_file(img_path, as_attachment=True)
    return "Nenhuma imagem encontrada", 404

def send_image():
    """
    Função auxiliar para retornar a imagem atual.
    
    A função retorna a imagem atual salva no diretório de upload.

    Returns:
        Response: A imagem atual.
    """
    img_path = os.path.join(app.config["UPLOAD_FOLDER"], session.get("img_id", "") + ".png")
    return send_file(img_path, mimetype="image/png")

@app.route("/save_image", methods=["POST"])
def save_image_to_server():
    """
    Salva a imagem do canvas (em base64) do frontend no servidor.
    
    A função decodifica a imagem em base64 recebida do formulário e salva no diretório de upload.

    Returns:
        str: O nome do ficheiro salvo ou uma mensagem de erro.
    """
    data_url = request.form.get("image_data")
    if not data_url:
        return "Nenhuma imagem recebida", 400
    header, encoded = data_url.split(",", 1)
    import base64
    img_data = base64.b64decode(encoded)
    filename = str(uuid.uuid4()) + ".png"
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    with open(filepath, "wb") as f:
        f.write(img_data)
    return filename

if __name__ == "__main__":
    app.run(debug=True)