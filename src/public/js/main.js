/**
 * Divine Essence — JavaScript Principal
 * Interações do catálogo público
 */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // Menu mobile
  // ============================================
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('aberto');
    });
  }

  // ============================================
  // Busca em tempo real (Header)
  // ============================================
  const inputBuscaHeader = document.getElementById('buscaHeader');
  if (inputBuscaHeader) {
    let timeoutBusca;
    inputBuscaHeader.addEventListener('input', (e) => {
      clearTimeout(timeoutBusca);
      timeoutBusca = setTimeout(() => {
        const termo = e.target.value.trim();
        if (termo.length >= 2) {
          window.location.href = `/catalogo?busca=${encodeURIComponent(termo)}`;
        }
      }, 600);
    });

    inputBuscaHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const termo = e.target.value.trim();
        window.location.href = `/catalogo?busca=${encodeURIComponent(termo)}`;
      }
    });
  }

  // ============================================
  // Busca em tempo real (Catálogo)
  // ============================================
  const inputBuscaCatalogo = document.getElementById('buscaCatalogo');
  if (inputBuscaCatalogo) {
    let timeoutCatalogo;
    inputBuscaCatalogo.addEventListener('input', (e) => {
      clearTimeout(timeoutCatalogo);
      timeoutCatalogo = setTimeout(() => {
        atualizarCatalogo();
      }, 400);
    });
  }

  // Selects de filtro
  const seletorCategoria = document.getElementById('filtroCategoriaSelect');
  const seletorOrdem = document.getElementById('filtroOrdemSelect');

  if (seletorCategoria) seletorCategoria.addEventListener('change', atualizarCatalogo);
  if (seletorOrdem) seletorOrdem.addEventListener('change', atualizarCatalogo);

  function atualizarCatalogo() {
    const busca = document.getElementById('buscaCatalogo')?.value || '';
    const categoria = seletorCategoria?.value || 'todas';
    const ordem = seletorOrdem?.value || '';

    const params = new URLSearchParams();
    if (busca) params.set('busca', busca);
    if (categoria && categoria !== 'todas') params.set('categoria', categoria);
    if (ordem) params.set('ordem', ordem);

    window.location.href = `/catalogo?${params.toString()}`;
  }

  // ============================================
  // Animação de entrada dos cards
  // ============================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.05}s`;
        entry.target.classList.add('animado-ativo');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card-produto').forEach(card => {
    observer.observe(card);
  });

  // ============================================
  // Filtros por categoria (tags)
  // ============================================
  document.querySelectorAll('.filtro-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const categoria = tag.dataset.categoria;
      const busca = document.getElementById('buscaCatalogo')?.value || '';
      const params = new URLSearchParams();
      if (busca) params.set('busca', busca);
      if (categoria && categoria !== 'todas') params.set('categoria', categoria);
      window.location.href = `/catalogo?${params.toString()}`;
    });
  });

  // ============================================
  // Smooth scroll para âncoras
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (alvo) {
        e.preventDefault();
        alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
