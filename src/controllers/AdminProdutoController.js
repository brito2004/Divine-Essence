/**
 * Controller: Administração de Produtos — async
 */
const ProdutoModel   = require('../models/ProdutoModel');
const CategoriaModel = require('../models/CategoriaModel');
const { processarUploadImagem, removerImagem } = require('../middlewares/upload');

class AdminProdutoController {
  static async dashboard(req, res) {
    try {
      const [totalProdutos, produtosDestaque, categorias, ultimosProdutos] = await Promise.all([
        ProdutoModel.contar(),
        ProdutoModel.contar({ destaque: true }),
        CategoriaModel.buscarTodas(),
        ProdutoModel.buscarTodos({}),
      ]);
      res.render('admin/dashboard', {
        titulo: 'Dashboard — Divine Essence Admin',
        adminNome: req.session.adminNome,
        totalProdutos, produtosDestaque,
        totalCategorias: categorias.length,
        ultimosProdutos: ultimosProdutos.slice(0, 5),
        sucesso: req.flash('success')[0] || null,
        erro: req.flash('error')[0] || null,
      });
    } catch (e) {
      console.error(e);
      res.status(500).render('erro', { mensagem: 'Erro ao carregar o dashboard.', codigo: 500 });
    }
  }

  static async listar(req, res) {
    try {
      const { busca, categoria } = req.query;
      const [produtos, categorias] = await Promise.all([
        ProdutoModel.buscarTodos({ busca, categoria }),
        CategoriaModel.buscarTodas(),
      ]);
      res.render('admin/produtos/lista', {
        titulo: 'Gerenciar Produtos — Admin',
        adminNome: req.session.adminNome,
        produtos, categorias,
        filtros: { busca: busca || '', categoria: categoria || 'todas' },
        sucesso: req.flash('success')[0] || null,
        erro: req.flash('error')[0] || null,
      });
    } catch (e) {
      console.error(e);
      req.flash('error', 'Erro ao carregar produtos.');
      res.redirect('/admin/dashboard');
    }
  }

  static async novoForm(req, res) {
    const categorias = await CategoriaModel.buscarTodas();
    res.render('admin/produtos/form', {
      titulo: 'Novo Produto — Admin',
      adminNome: req.session.adminNome,
      produto: null, categorias,
      erro: req.flash('error')[0] || null,
    });
  }

  static async criar(req, res) {
    try {
      const { nome, descricao, preco, categoria, destaque } = req.body;
      if (!nome || !preco || !categoria) {
        req.flash('error', 'Nome, preço e categoria são obrigatórios.');
        return res.redirect('/admin/produtos/novo');
      }
      if (isNaN(parseFloat(preco)) || parseFloat(preco) <= 0) {
        req.flash('error', 'Preço inválido.');
        return res.redirect('/admin/produtos/novo');
      }
      let imagem = 'placeholder.svg';
      if (req.files?.imagem) imagem = await processarUploadImagem(req.files.imagem);
      await ProdutoModel.criar({ nome: nome.trim(), descricao: descricao?.trim() || '',
        preco: parseFloat(preco), categoria, imagem, destaque: destaque === 'on' });
      req.flash('success', `Produto "${nome}" criado com sucesso!`);
      return res.redirect('/admin/produtos');
    } catch (e) {
      console.error(e);
      req.flash('error', `Erro ao criar produto: ${e.message}`);
      return res.redirect('/admin/produtos/novo');
    }
  }

  static async editarForm(req, res) {
    try {
      const [produto, categorias] = await Promise.all([
        ProdutoModel.buscarPorId(req.params.id),
        CategoriaModel.buscarTodas(),
      ]);
      if (!produto) { req.flash('error', 'Produto não encontrado.'); return res.redirect('/admin/produtos'); }
      res.render('admin/produtos/form', {
        titulo: `Editar: ${produto.nome}`,
        adminNome: req.session.adminNome,
        produto, categorias,
        erro: req.flash('error')[0] || null,
      });
    } catch (e) {
      req.flash('error', 'Erro ao carregar produto.'); res.redirect('/admin/produtos');
    }
  }

  static async atualizar(req, res) {
    try {
      const { nome, descricao, preco, categoria, destaque } = req.body;
      const id = req.params.id;
      const produto = await ProdutoModel.buscarPorId(id);
      if (!produto) { req.flash('error', 'Produto não encontrado.'); return res.redirect('/admin/produtos'); }
      if (!nome || !preco || !categoria) {
        req.flash('error', 'Nome, preço e categoria são obrigatórios.');
        return res.redirect(`/admin/produtos/${id}/editar`);
      }
      const dados = { nome: nome.trim(), descricao: descricao?.trim() || '',
        preco: parseFloat(preco), categoria, destaque: destaque === 'on' };
      if (req.files?.imagem) dados.imagem = await processarUploadImagem(req.files.imagem, produto.imagem);
      await ProdutoModel.atualizar(id, dados);
      req.flash('success', `Produto "${nome}" atualizado!`);
      return res.redirect('/admin/produtos');
    } catch (e) {
      console.error(e);
      req.flash('error', `Erro ao atualizar: ${e.message}`);
      return res.redirect(`/admin/produtos/${req.params.id}/editar`);
    }
  }

  static async excluir(req, res) {
    try {
      const produto = await ProdutoModel.buscarPorId(req.params.id);
      if (!produto) { req.flash('error', 'Produto não encontrado.'); return res.redirect('/admin/produtos'); }
      removerImagem(produto.imagem);
      await ProdutoModel.excluir(req.params.id);
      req.flash('success', `Produto "${produto.nome}" excluído.`);
      return res.redirect('/admin/produtos');
    } catch (e) {
      console.error(e);
      req.flash('error', 'Erro ao excluir produto.');
      return res.redirect('/admin/produtos');
    }
  }
}

module.exports = AdminProdutoController;
