/**
 * Setup do banco de dados — SQLite e PostgreSQL
 * Execute: node database/setup.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('../src/config/database');

async function setup() {
  console.log('🚀 Iniciando setup...\n');
  const db = getDb();
  const isPg = db.type === 'postgres';

  // SQLite: exec não aceita múltiplos statements num só string com condicionais inline
  // Executa cada CREATE TABLE separadamente
  if (isPg) {
    await db.exec(`CREATE TABLE IF NOT EXISTS produtos (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco NUMERIC NOT NULL,
      categoria TEXT NOT NULL,
      imagem TEXT DEFAULT 'placeholder.svg',
      destaque INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
  } else {
    await db.exec(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      categoria TEXT NOT NULL,
      imagem TEXT DEFAULT 'placeholder.svg',
      destaque INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )`);
  }
  console.log('✅ Tabela produtos OK');

  if (isPg) {
    await db.exec(`CREATE TABLE IF NOT EXISTS categorias (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } else {
    await db.exec(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      created_at DATETIME DEFAULT (datetime('now'))
    )`);
  }
  console.log('✅ Tabela categorias OK');

  if (isPg) {
    await db.exec(`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } else {
    await db.exec(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now'))
    )`);
  }
  console.log('✅ Tabela admins OK');

  // Inserir categorias padrão
  const categorias = [
    ['Perfumes','Fragrâncias exclusivas'],
    ['Body Splash','Águas perfumadas leves'],
    ['Cremes','Hidratação com fragrâncias'],
    ['Hidratantes','Loções hidratantes'],
    ['Kits','Conjuntos e presentes'],
    ['Outros','Outros produtos'],
  ];
  for (const [nome, descricao] of categorias) {
    try {
      if (isPg) {
        await db.run('INSERT INTO categorias (nome, descricao) VALUES (?,?) ON CONFLICT (nome) DO NOTHING', [nome, descricao]);
      } else {
        await db.run('INSERT OR IGNORE INTO categorias (nome, descricao) VALUES (?,?)', [nome, descricao]);
      }
    } catch(e) {}
  }
  console.log('✅ Categorias OK');

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@divineessence.com';
  const adminSenha = process.env.ADMIN_SENHA || 'Admin@2024!';
  const adminNome  = process.env.ADMIN_NOME  || 'Administrador';

  const existe = await db.get('SELECT id FROM admins WHERE email = ?', [adminEmail]);
  if (!existe) {
    const hash = await bcrypt.hash(adminSenha, 12);
    await db.run('INSERT INTO admins (nome, email, senha_hash) VALUES (?,?,?)', [adminNome, adminEmail, hash]);
    console.log('\n✅ Admin criado!');
    console.log('   📧 Email:', adminEmail);
    console.log('   🔑 Senha:', adminSenha);
    console.log('   ⚠️  Altere a senha após o primeiro acesso!\n');
  } else {
    console.log('ℹ️  Admin já existe, pulando.');
  }

  // Produtos de exemplo
  const row = await db.get('SELECT COUNT(*) as total FROM produtos', []);
  const total = parseInt(row.total || row.count || 0);
  if (total === 0) {
    const produtos = [
      ['La Vie Est Belle','Fragrância floral oriental. Notas de íris, pralinê e baunilha.',289.90,'Perfumes',1],
      ['Velvet Rose','Elegância da rosa búlgara com framboesa e almíscar branco.',199.90,'Perfumes',1],
      ['Bloom Splash','Body splash com peônia, maçã verde e almíscar.',79.90,'Body Splash',1],
      ['Vanilla Dream','Hidratante com baunilha e coco. Textura sedosa.',89.90,'Hidratantes',0],
      ['Midnight Orchid','Orquídea negra, âmbar e sândalo. Fragrância misteriosa.',349.90,'Perfumes',1],
      ['Kit Presente Essencial','Perfume 100ml + body splash 200ml + hidratante 250ml.',299.90,'Kits',0],
    ];
    for (const [nome, descricao, preco, categoria, destaque] of produtos) {
      await db.run(
        'INSERT INTO produtos (nome,descricao,preco,categoria,imagem,destaque) VALUES (?,?,?,?,?,?)',
        [nome, descricao, preco, categoria, 'placeholder.svg', destaque]
      );
    }
    console.log('✅ Produtos de exemplo inseridos.');
  }

  console.log('\n🎉 Setup concluído! Execute "npm start" para iniciar.\n');
  process.exit(0);
}

setup().catch(err => { console.error('❌ Erro no setup:', err); process.exit(1); });
