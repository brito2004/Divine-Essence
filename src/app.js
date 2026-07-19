/**
 * Divine Essence — Aplicação Principal
 * Ponto de entrada do servidor Express
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');

// Inicializar banco de dados
const { getDb } = require('./config/database');
getDb(); // Conectar ao iniciar

// Rotas
const rotasPublicas = require('./routes/publico');
const rotasAdmin = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Configurações de Segurança
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// ============================================
// View Engine (EJS)
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// Middlewares Globais
// ============================================
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// Upload de arquivos
app.use(fileUpload({
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  useTempFiles: false,
  abortOnLimit: true
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Sessão e Flash
// ============================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'divine_essence_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 horas
  }
}));

app.use(flash());

// ============================================
// Variáveis globais para as views
// ============================================
app.use((req, res, next) => {
  res.locals.anoAtual = new Date().getFullYear();
  res.locals.isAdmin = !!(req.session && req.session.adminId);
  next();
});

// ============================================
// Rotas
// ============================================
app.use('/', rotasPublicas);
app.use('/admin', rotasAdmin);

// ============================================
// Erro 404
// ============================================
app.use((req, res) => {
  res.status(404).render('erro', {
    titulo: 'Página não encontrada',
    mensagem: 'A página que você está procurando não existe.',
    codigo: 404
  });
});

// ============================================
// Erro 500
// ============================================
app.use((err, req, res, next) => {
  console.error('Erro interno:', err.stack);
  res.status(500).render('erro', {
    titulo: 'Erro interno',
    mensagem: 'Ocorreu um erro inesperado. Tente novamente.',
    codigo: 500
  });
});

// ============================================
// Iniciar servidor
// ============================================
app.listen(PORT, () => {
  console.log(`\n✨ Divine Essence rodando em: http://localhost:${PORT}`);
  console.log(`🔐 Painel admin: http://localhost:${PORT}/admin/login`);
  console.log(`📦 Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
