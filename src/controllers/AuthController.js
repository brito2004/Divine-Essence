/**
 * Controller: Autenticação Admin
 * Gerencia login, logout e sessão do administrador
 */

const AdminModel = require('../models/AdminModel');

class AuthController {
  /**
   * Exibe página de login
   */
  static exibirLogin(req, res) {
    res.render('admin/login', {
      titulo: 'Acesso Administrativo — Divine Essence',
      erro: req.flash('error')[0] || null,
      sucesso: req.flash('success')[0] || null
    });
  }

  /**
   * Processa o login
   */
  static async processarLogin(req, res) {
    try {
      const { email, senha } = req.body;

      // Validação básica
      if (!email || !senha) {
        req.flash('error', 'Email e senha são obrigatórios.');
        return res.redirect('/admin/login');
      }

      // Verificar credenciais
      const admin = await AdminModel.verificarCredenciais(email.trim(), senha);

      if (!admin) {
        // Delay para dificultar brute force
        await new Promise(r => setTimeout(r, 500));
        req.flash('error', 'Email ou senha incorretos.');
        return res.redirect('/admin/login');
      }

      // Criar sessão
      req.session.adminId = admin.id;
      req.session.adminNome = admin.nome;
      req.session.adminEmail = admin.email;

      req.flash('success', `Bem-vindo, ${admin.nome}!`);
      return res.redirect('/admin/dashboard');
    } catch (erro) {
      console.error('Erro no login:', erro);
      req.flash('error', 'Erro interno. Tente novamente.');
      return res.redirect('/admin/login');
    }
  }

  /**
   * Processa o logout
   */
  static logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
      }
      res.redirect('/admin/login');
    });
  }
}

module.exports = AuthController;
