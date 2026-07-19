/**
 * Rotas Administrativas — Protegidas por autenticação
 */

const express = require('express');
const router = express.Router();
const { requireAuth, redirectIfAuthenticated } = require('../middlewares/auth');
const AuthController = require('../controllers/AuthController');
const AdminProdutoController = require('../controllers/AdminProdutoController');
const AdminCategoriaController = require('../controllers/AdminCategoriaController');

// ----------------------------------------
// Autenticação
// ----------------------------------------
router.get('/login', redirectIfAuthenticated, AuthController.exibirLogin);
router.post('/login', redirectIfAuthenticated, AuthController.processarLogin);
router.get('/logout', requireAuth, AuthController.logout);

// ----------------------------------------
// Dashboard (protegido)
// ----------------------------------------
router.get('/dashboard', requireAuth, AdminProdutoController.dashboard);

// Redireciona /admin para dashboard
router.get('/', requireAuth, (req, res) => res.redirect('/admin/dashboard'));

// ----------------------------------------
// Produtos (protegidos)
// ----------------------------------------
router.get('/produtos', requireAuth, AdminProdutoController.listar);
router.get('/produtos/novo', requireAuth, AdminProdutoController.novoForm);
router.post('/produtos/novo', requireAuth, AdminProdutoController.criar);
router.get('/produtos/:id/editar', requireAuth, AdminProdutoController.editarForm);
router.post('/produtos/:id/editar', requireAuth, AdminProdutoController.atualizar);
router.post('/produtos/:id/excluir', requireAuth, AdminProdutoController.excluir);

// ----------------------------------------
// Categorias (protegidas)
// ----------------------------------------
router.get('/categorias', requireAuth, AdminCategoriaController.listar);
router.post('/categorias/nova', requireAuth, AdminCategoriaController.criar);
router.post('/categorias/:id/editar', requireAuth, AdminCategoriaController.atualizar);
router.post('/categorias/:id/excluir', requireAuth, AdminCategoriaController.excluir);

module.exports = router;
