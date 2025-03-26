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

// Pilha para armazenar os estados do canvas
let undoStack = [];

// Salva o estado atual do canvas na pilha
function saveState() {
  undoStack.push(canvas.toDataURL());
  if (undoStack.length > 20) {
    // Limita o tamanho da pilha para evitar uso excessivo de memória
    undoStack.shift();
  }
}

// Função para desfazer a última ação
function undo() {
  if (undoStack.length === 0) {
    alert("Nenhuma ação para desfazer.");
    return;
  }

  // Remove o último estado da pilha e restaura o canvas
  const previousState = undoStack.pop();
  const img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = previousState;
}

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
  saveState(); // Salva o estado antes de começar a desenhar
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
      // Limita o tamanho máximo da imagem
      const maxWidth = 800;
      const maxHeight = 600;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        } else {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      }

      // Ajusta o tamanho do canvas
      canvas.width = width;
      canvas.height = height;

      // Desenha a imagem redimensionada no canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);
      originalImage = img; // Salva a imagem original para referência
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

// Restaura a imagem original do servidor
async function restoreOriginalImage() {
  try {
    const response = await fetch('/reset_image', { method: 'POST' });
    if (!response.ok) {
      alert('Erro ao restaurar a imagem original.');
      return;
    }
    const blob = await response.blob();
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      originalImage = img; // Atualiza a referência da imagem original
    };
    img.src = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Erro ao restaurar a imagem:', error);
  }
}

// Função para aplicar filtros de brilho e contraste
function applyFilters() {
  saveState(); // Salva o estado antes de aplicar filtros
  let brightnessVal = brightnessRange.value / 100;
  let contrastVal = contrastRange.value / 100;

  brightnessVal = Math.min(Math.max(brightnessVal, 0), 2);
  contrastVal = Math.min(Math.max(contrastVal, 0), 2);

  let filterStr = `brightness(${brightnessVal}) contrast(${contrastVal})`;
  let tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  let tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = filterStr;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.filter = 'none';
  updateOriginalImage();
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
  saveState(); // Salva o estado antes de redimensionar
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

  // Criar um canvas temporário para salvar os desenhos atuais
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  tempCtx.drawImage(canvas, 0, 0); // Copia o conteúdo atual (imagem + desenhos)

  // Ajustar rotação
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Mover a origem para o centro antes de rotacionar
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);

  // Redesenhar a imagem e os desenhos mantendo a posição correta
  ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);

  ctx.restore();
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

function resetFilter() {
  if (!originalImage) {
    alert("Nenhuma imagem carregada para resetar.");
    return;
  }

  // Ajusta o tamanho do canvas para o tamanho original da imagem
  canvas.width = originalImage.width;
  canvas.height = originalImage.height;

  // Limpa o canvas e redesenha a imagem original
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

  // Reseta os valores dos controles de brilho e contraste
  brightnessRange.value = 100;
  contrastRange.value = 100;

  // Atualiza a imagem original no estado atual
  updateOriginalImage();
}
