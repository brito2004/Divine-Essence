/**
 * Middleware de autenticação
 * Protege rotas administrativas
 */

/**
 * Verifica se o usuário está autenticado
 * Redireciona para login se não estiver
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  
  req.flash('error', 'Acesso restrito. Faça login para continuar.');
  return res.redirect('/admin/login');
}

/**
 * Redireciona usuário já autenticado
 * Evita que admin logado acesse a tela de login novamente
 */
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  return next();
}

module.exports = { requireAuth, redirectIfAuthenticated };
