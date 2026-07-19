/**
 * Rotas Públicas — Catálogo
 */

const express = require('express');
const router = express.Router();
const CatalogoController = require('../controllers/CatalogoController');

// Página inicial
router.get('/', CatalogoController.index);

// Catálogo de produtos
router.get('/catalogo', CatalogoController.catalogo);

// Detalhe do produto
router.get('/produto/:id', CatalogoController.detalheProduto);

// API de busca em tempo real (AJAX)
router.get('/api/busca', CatalogoController.buscaAjax);

module.exports = router;
