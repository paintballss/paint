// Seleciona o canvas e o contexto 2D
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Variáveis para controle de ferramentas e desenho
let currentTool = 'pencil';
let drawing = false;
let startX = 0, startY = 0;
let color = '#000000';
let lineWidth = 2;
let textValue = '';
let originalImage = null;  // Guarda a imagem base

// Referências a elementos do DOM
const toolSelect = document.getElementById('toolSelect');
const colorPicker = document.getElementById('colorPicker');
const lineWidthInput = document.getElementById('lineWidth');
const textInput = document.getElementById('textInput');
const brightnessRange = document.getElementById('brightnessRange');
const contrastRange = document.getElementById('contrastRange');
const statusMsg = document.getElementById('statusMsg');
const serverDownloadLink = document.getElementById('serverDownloadLink');

// Atualiza valores
colorPicker.addEventListener('change', () => color = colorPicker.value);
lineWidthInput.addEventListener('change', () => lineWidth = parseInt(lineWidthInput.value));
textInput.addEventListener('input', () => textValue = textInput.value);
toolSelect.addEventListener('change', () => currentTool = toolSelect.value);

// Eventos do canvas
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mouseleave', () => { drawing = false; });

// Funções de desenho no canvas
function onMouseDown(e) {
  drawing = true;
  [startX, startY] = getMousePos(e);
  if (currentTool === 'text') {
    ctx.fillStyle = color;
    ctx.font = `${lineWidth * 10}px sans-serif`;
    ctx.fillText(textValue, startX, startY);
    drawing = false;
  }
}

function onMouseMove(e) {
  if (!drawing) return;
  const [x, y] = getMousePos(e);
  if (currentTool === 'pencil') {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    [startX, startY] = [x, y];
  }
}

function onMouseUp(e) {
  if (!drawing) return;
  drawing = false;
  const [x, y] = getMousePos(e);
  if (currentTool === 'rectangle') {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  } else if (currentTool === 'circle') {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    let radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

// Converte coordenadas do mouse/tela para o canvas
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return [
    (e.clientX - rect.left) * (canvas.width / rect.width),
    (e.clientY - rect.top) * (canvas.height / rect.height)
  ];
}

// Limpar o canvas (se houver originalImage, redesenha)
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (originalImage) {
    ctx.drawImage(originalImage, 0, 0);
  }
}

// Adiciona funcionalidade para carregar imagem
document.getElementById("fileInput").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Ajusta o tamanho do canvas para a imagem
      canvas.width = img.width;
      canvas.height = img.height;

      // Desenha a imagem no canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas antes de desenhar
      ctx.drawImage(img, 0, 0);
      originalImage = img;  // Salva a imagem original para referência
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// Cria uma nova imagem em branco
function createNewImage() {
  let width = prompt("Largura da nova imagem (px):", 800);
  let height = prompt("Altura da nova imagem (px):", 600);
  if (!width || !height) return;
  canvas.width = parseInt(width);
  canvas.height = parseInt(height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  originalImage = null;
}

// Restaura a imagem original
function restoreOriginalImage() {
  if (originalImage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);
    updateOriginalImage();  // Atualiza a imagem original
  } else {
    alert("Nenhuma imagem original para restaurar.");
  }
}

// Função para aplicar filtros de brilho e contraste
function applyFilters() {
    let brightnessVal = brightnessRange.value / 100;
    let contrastVal = contrastRange.value / 100;
  
    // Garantir que o valor do brilho e contraste esteja entre 0 e 2
    brightnessVal = Math.min(Math.max(brightnessVal, 0), 2);
    contrastVal = Math.min(Math.max(contrastVal, 0), 2);
  
    // Aplicando os filtros ao canvas
    let filterStr = `brightness(${brightnessVal}) contrast(${contrastVal})`;
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    let tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    
    // Limpar o canvas e aplicar os filtros
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterStr;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';  // Limpar o filtro para futuras edições
    updateOriginalImage();  // Atualizar a imagem original
  }

  function applyFilter(filterType) {
    let filterStr = '';
    if (filterType === 'grayscale') {
      filterStr = 'grayscale(100%)';
    } else if (filterType === 'sepia') {
      filterStr = 'sepia(100%)';
    }
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = filterStr;
    ctx.drawImage(originalImage, 0, 0);
    ctx.filter = 'none';
    updateOriginalImage();  // Atualizar a imagem original
  }
  

function applyResize() {
    let width = parseInt(document.getElementById('resizeWidth').value);
    let height = parseInt(document.getElementById('resizeHeight').value);
  
    if (!originalImage || isNaN(width) || isNaN(height)) {
      alert('Por favor, insira dimensões válidas.');
      return;
    }
  
    // Ajuste o tamanho do canvas e redimensione a imagem
    canvas.width = width;
    canvas.height = height;
    
    // Desenhar a imagem redimensionada no canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, width, height);
    updateOriginalImage();  // Atualizar a imagem original
  }

// Envio de imagem para rotação (exemplo de como pode ser feito)
function applyRotation() {
    let angle = parseInt(document.getElementById('rotateAngle').value);
    if (!originalImage) {
      alert('Nenhuma imagem carregada.');
      return;
    }
  
    // Criar uma nova canvas temporária para aplicar a rotação
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    
    // Ajustar o tamanho da canvas temporária conforme a rotação
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Aplicar a rotação
    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((angle * Math.PI) / 180);
    tempCtx.drawImage(originalImage, -canvas.width / 2, -canvas.height / 2);
    tempCtx.restore();
  
    // Atualizar o canvas principal
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    updateOriginalImage();  // Atualizar a imagem original
  }

// Atualiza originalImage para refletir o estado atual do canvas
function updateOriginalImage() {
  let dataURL = canvas.toDataURL('image/png');
  let img = new Image();
  img.onload = function() {
    originalImage = img;
  };
  img.src = dataURL;
}

// Função para salvar a imagem no servidor
async function saveToServer() {
  let dataURL = canvas.toDataURL('image/png');
  let formData = new FormData();
  formData.append('image_data', dataURL);
  statusMsg.textContent = "Enviando imagem...";
  serverDownloadLink.innerHTML = "";
  try {
    let resp = await fetch('/save_image', { method: 'POST', body: formData });
    if (!resp.ok) {
      statusMsg.textContent = "Erro ao salvar no servidor.";
      return;
    }
    statusMsg.textContent = "Imagem salva no servidor!";
  } catch (e) {
    console.error(e);
    statusMsg.textContent = "Falha ao enviar imagem.";
  }
}

// Download direto do canvas
function downloadCanvas() {
  let link = document.createElement('a');
  link.download = 'imagem_modificada.png';
  link.href = canvas.toDataURL();
  link.click();
}

// Restauração e reset
document.getElementById('reset').addEventListener('click', restoreOriginalImage);

// Aplicação de rotação, redimensionamento e filtros
document.getElementById('applyRotation').addEventListener('click', applyRotation);
document.getElementById('applyResize').addEventListener('click', applyResize);
