/**
 * Divine Essence — JavaScript Administrativo
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Preview de imagem no upload
  // ============================================
  const inputImagem = document.getElementById('inputImagem');
  const previewImagem = document.getElementById('previewImagem');
  const uploadArea = document.getElementById('uploadArea');

  if (inputImagem) {
    inputImagem.addEventListener('change', (e) => {
      const arquivo = e.target.files[0];
      if (arquivo && arquivo.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (previewImagem) {
            previewImagem.src = ev.target.result;
            previewImagem.style.display = 'block';
          }
        };
        reader.readAsDataURL(arquivo);
      }
    });

    if (uploadArea) {
      uploadArea.addEventListener('click', () => inputImagem.click());
      
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#C9A96E';
      });

      uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        const arquivo = e.dataTransfer.files[0];
        if (arquivo && arquivo.type.startsWith('image/')) {
          inputImagem.files = e.dataTransfer.files;
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (previewImagem) {
              previewImagem.src = ev.target.result;
              previewImagem.style.display = 'block';
            }
          };
          reader.readAsDataURL(arquivo);
        }
      });
    }
  }

  // ============================================
  // Modais de confirmação
  // ============================================
  document.querySelectorAll('[data-confirmar]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const mensagem = btn.dataset.confirmar || 'Deseja confirmar esta ação?';
      const form = btn.closest('form') || document.querySelector(btn.dataset.form);
      
      if (confirm(mensagem) && form) {
        form.submit();
      }
    });
  });

  // ============================================
  // Auto-dismiss de alertas
  // ============================================
  document.querySelectorAll('.alerta').forEach(alerta => {
    setTimeout(() => {
      alerta.style.transition = 'opacity 0.5s ease';
      alerta.style.opacity = '0';
      setTimeout(() => alerta.remove(), 500);
    }, 4000);
  });

  // ============================================
  // Validação de formulário de produto
  // ============================================
  const formProduto = document.getElementById('formProduto');
  if (formProduto) {
    formProduto.addEventListener('submit', (e) => {
      const nome = document.getElementById('nome')?.value?.trim();
      const preco = document.getElementById('preco')?.value;
      const categoria = document.getElementById('categoria')?.value;

      let valido = true;
      const erros = [];

      if (!nome || nome.length < 2) {
        erros.push('Nome deve ter pelo menos 2 caracteres.');
        valido = false;
      }

      if (!preco || isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
        erros.push('Insira um preço válido maior que zero.');
        valido = false;
      }

      if (!categoria) {
        erros.push('Selecione uma categoria.');
        valido = false;
      }

      if (!valido) {
        e.preventDefault();
        alert('Corrija os seguintes erros:\n\n' + erros.join('\n'));
      }
    });
  }

  // ============================================
  // Formatação de preço ao digitar
  // ============================================
  const inputPreco = document.getElementById('preco');
  if (inputPreco) {
    inputPreco.addEventListener('blur', () => {
      const valor = parseFloat(inputPreco.value);
      if (!isNaN(valor)) {
        inputPreco.value = valor.toFixed(2);
      }
    });
  }
});
