/**
 * Controller: Administração de Categorias — async
 */
const CategoriaModel = require('../models/CategoriaModel');

class AdminCategoriaController {
  static async listar(req, res) {
    try {
      const categorias = await CategoriaModel.buscarTodas();
      res.render('admin/categorias/lista', {
        titulo: 'Gerenciar Categorias — Admin',
        adminNome: req.session.adminNome,
        categorias,
        sucesso: req.flash('success')[0] || null,
        erro: req.flash('error')[0] || null,
      });
    } catch (e) {
      req.flash('error', 'Erro ao carregar categorias.'); res.redirect('/admin/dashboard');
    }
  }

  static async criar(req, res) {
    try {
      const { nome, descricao } = req.body;
      if (!nome?.trim()) { req.flash('error', 'Nome obrigatório.'); return res.redirect('/admin/categorias'); }
      const existe = await CategoriaModel.buscarPorNome(nome.trim());
      if (existe) { req.flash('error', 'Categoria já existe.'); return res.redirect('/admin/categorias'); }
      await CategoriaModel.criar({ nome: nome.trim(), descricao: descricao || '' });
      req.flash('success', `Categoria "${nome}" criada!`);
      return res.redirect('/admin/categorias');
    } catch (e) {
      req.flash('error', 'Erro ao criar categoria.'); return res.redirect('/admin/categorias');
    }
  }

  static async atualizar(req, res) {
    try {
      const { nome, descricao } = req.body;
      if (!nome?.trim()) { req.flash('error', 'Nome obrigatório.'); return res.redirect('/admin/categorias'); }
      await CategoriaModel.atualizar(req.params.id, { nome: nome.trim(), descricao: descricao || '' });
      req.flash('success', 'Categoria atualizada!');
      return res.redirect('/admin/categorias');
    } catch (e) {
      req.flash('error', 'Erro ao atualizar.'); return res.redirect('/admin/categorias');
    }
  }

  static async excluir(req, res) {
    try {
      await CategoriaModel.excluir(req.params.id);
      req.flash('success', 'Categoria excluída.');
      return res.redirect('/admin/categorias');
    } catch (e) {
      req.flash('error', e.message || 'Erro ao excluir.'); return res.redirect('/admin/categorias');
    }
  }
}

module.exports = AdminCategoriaController;
