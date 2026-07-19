/**
 * Middleware e serviço de upload de imagens
 * Gerencia o upload de fotos dos produtos
 */

const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.resolve('./src/public/images/produtos');
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Garantir que o diretório de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Processa o upload de uma imagem de produto
 * @param {Object} arquivo - Objeto de arquivo do express-fileupload
 * @param {string|null} imagemAtual - Nome da imagem atual (para substituição)
 * @returns {string} Nome do arquivo salvo
 */
async function processarUploadImagem(arquivo, imagemAtual = null) {
  if (!arquivo) {
    throw new Error('Nenhum arquivo enviado');
  }

  // Validar tipo
  if (!TIPOS_PERMITIDOS.includes(arquivo.mimetype)) {
    throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
  }

  // Validar tamanho
  if (arquivo.size > MAX_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo permitido: ${MAX_SIZE / 1024 / 1024}MB`);
  }

  // Gerar nome único
  const extensao = path.extname(arquivo.name).toLowerCase();
  const nomeArquivo = `produto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extensao}`;
  const caminhoDestino = path.join(UPLOAD_DIR, nomeArquivo);

  // Salvar arquivo
  await arquivo.mv(caminhoDestino);

  // Remover imagem antiga se existir (exceto as padrão)
  if (imagemAtual && !imagemAtual.startsWith('default-')) {
    const caminhoAntigo = path.join(UPLOAD_DIR, imagemAtual);
    if (fs.existsSync(caminhoAntigo)) {
      fs.unlinkSync(caminhoAntigo);
    }
  }

  return nomeArquivo;
}

/**
 * Remove uma imagem do servidor
 * @param {string} nomeArquivo - Nome do arquivo a remover
 */
function removerImagem(nomeArquivo) {
  if (!nomeArquivo || nomeArquivo.startsWith('default-')) return;
  
  const caminho = path.join(UPLOAD_DIR, nomeArquivo);
  if (fs.existsSync(caminho)) {
    fs.unlinkSync(caminho);
  }
}

module.exports = { processarUploadImagem, removerImagem, UPLOAD_DIR };
