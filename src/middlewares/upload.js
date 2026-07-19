/**
 * Upload de imagens via Cloudinary
 * Imagens ficam permanentes mesmo após redeploy
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

async function processarUploadImagem(arquivo, imagemAtual = null) {
  if (!arquivo) throw new Error('Nenhum arquivo enviado');
  if (!TIPOS_PERMITIDOS.includes(arquivo.mimetype)) throw new Error('Tipo não permitido. Use JPEG, PNG ou WebP.');
  if (arquivo.size > MAX_SIZE) throw new Error('Arquivo muito grande. Máximo 5MB.');

  // Upload direto do buffer para o Cloudinary
  const resultado = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'divine-essence/produtos', resource_type: 'image' },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(arquivo.data);
  });

  // Remover imagem antiga do Cloudinary se existir
  if (imagemAtual && imagemAtual.startsWith('https://res.cloudinary.com')) {
    const publicId = imagemAtual.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  return resultado.secure_url;
}

function removerImagem(url) {
  if (!url || !url.startsWith('https://res.cloudinary.com')) return;
  const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
  cloudinary.uploader.destroy(publicId).catch(() => {});
}

module.exports = { processarUploadImagem, removerImagem };