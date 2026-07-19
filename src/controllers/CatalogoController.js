/**
 * Controller: Catálogo Público
 */
const ProdutoModel   = require('../models/ProdutoModel');
const CategoriaModel = require('../models/CategoriaModel');

class CatalogoController {
  static async index(req, res) {
    try {
      const [produtosDestaque, categorias, totalProdutos] = await Promise.all([
        ProdutoModel.buscarTodos({ destaque: true }),
        CategoriaModel.buscarTodas(),
        ProdutoModel.contar(),
      ]);
      res.render('index', { titulo: 'Divine Essence — Fragrâncias que contam histórias',
        produtosDestaque, categorias, totalProdutos, paginaAtual: 'home' });
    } catch (e) {
      console.error(e);
      res.status(500).render('erro', { mensagem: 'Erro ao carregar a página inicial.', codigo: 500 });
    }
  }

  static async catalogo(req, res) {
    try {
      const { busca, categoria, ordem } = req.query;
      const filtros = { busca: busca?.trim() || '', categoria: categoria || 'todas', ordenacao: ordem || '' };
      const [produtos, categorias] = await Promise.all([
        ProdutoModel.buscarTodos(filtros),
        CategoriaModel.buscarTodas(),
      ]);
      res.render('catalogo', { titulo: 'Catálogo — Divine Essence', produtos, categorias,
        filtros, totalResultados: produtos.length, paginaAtual: 'catalogo' });
    } catch (e) {
      console.error(e);
      res.status(500).render('erro', { mensagem: 'Erro ao carregar o catálogo.', codigo: 500 });
    }
  }

  static async detalheProduto(req, res) {
    try {
      const produto = await ProdutoModel.buscarPorId(req.params.id);
      if (!produto) return res.status(404).render('erro',
        { titulo: 'Produto não encontrado', mensagem: 'Produto removido ou inexistente.', codigo: 404 });

      const todos = await ProdutoModel.buscarTodos({ categoria: produto.categoria });
      const relacionados = todos.filter(p => p.id != produto.id).slice(0, 4);

      res.render('produto', { titulo: `${produto.nome} — Divine Essence`, produto, relacionados, paginaAtual: 'catalogo' });
    } catch (e) {
      console.error(e);
      res.status(500).render('erro', { mensagem: 'Erro ao carregar o produto.', codigo: 500 });
    }
  }

  static async buscaAjax(req, res) {
    try {
      const produtos = await ProdutoModel.buscarTodos({ busca: req.query.q || '', categoria: req.query.categoria || 'todas' });
      res.json({ sucesso: true, total: produtos.length,
        produtos: produtos.map(p => ({ id: p.id, nome: p.nome, categoria: p.categoria,
          preco: p.preco, imagem: p.imagem, descricao: (p.descricao || '').substring(0, 100) })) });
    } catch (e) {
      res.status(500).json({ sucesso: false, mensagem: 'Erro na busca.' });
    }
  }
}

module.exports = CatalogoController;
