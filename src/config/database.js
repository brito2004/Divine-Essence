/**
 * Camada de banco de dados com suporte duplo:
 *  - PostgreSQL  → quando DATABASE_URL estiver definida (produção)
 *  - SQLite WASM → caso contrário (desenvolvimento local)
 *
 * Ambos expõem a mesma interface: { run, get, all, exec }
 * para que os Models não precisem saber qual banco está ativo.
 */

require('dotenv').config();

let adapter;

/* ─────────────────────────────────────────────
   Adaptador SQLite (desenvolvimento)
───────────────────────────────────────────── */
function makeSqliteAdapter() {
  const { Database } = require('node-sqlite3-wasm');
  const path = require('path');
  const fs   = require('fs');

  const dbPath = path.resolve(process.env.DB_PATH || './database/divine_essence.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  console.log('🗄️  SQLite conectado:', dbPath);

  return {
    // Executa SQL sem retorno (CREATE, INSERT sem RETURNING, etc.)
    run(sql, params = []) {
      return db.run(sql, params);          // { lastInsertRowid, changes }
    },
    // Retorna uma linha
    get(sql, params = []) {
      return db.get(sql, params);          // objeto ou undefined
    },
    // Retorna várias linhas
    all(sql, params = []) {
      return db.all(sql, params);          // array
    },
    // Executa bloco SQL puro (sem parâmetros)
    exec(sql) {
      return db.exec(sql);
    },
    type: 'sqlite',
  };
}

/* ─────────────────────────────────────────────
   Adaptador PostgreSQL (produção)
   Usa pg de forma síncrona-like via pool +
   queries executadas de forma assíncrona,
   mas encapsuladas para manter a interface igual.
   Como o Node.js é single-thread nos controllers,
   usamos um client dedicado por processo para
   manter a simplicidade dos Models síncronos.
   Para escala maior, migrar para async/await.
───────────────────────────────────────────── */
function makePgAdapter() {
  const { Pool } = require('pg');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
    max: 5,
  });

  console.log('🐘 PostgreSQL conectado via DATABASE_URL');

  // Converte placeholders ? → $1, $2, ... (padrão do pg)
  function convertPlaceholders(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
  }

  // Converte AUTOINCREMENT → SERIAL, datetime('now') → NOW(), etc.
  function convertSql(sql) {
    return sql
      .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
      .replace(/datetime\('now'\)/gi, "NOW()")
      .replace(/DEFAULT CURRENT_TIMESTAMP/gi, 'DEFAULT NOW()')
      .replace(/\bTEXT\b/g, 'TEXT')          // já compatível
      .replace(/\bREAL\b/g, 'NUMERIC')
      .replace(/INSERT OR IGNORE/gi, 'INSERT')
      .replace(/ON CONFLICT.*$/gim, 'ON CONFLICT DO NOTHING');
  }

  // Executa query de forma síncrona usando execSync via child_process não é viável —
  // então usamos uma fila de promises resolvida na inicialização.
  // Para simplificar o código dos Models (que são síncronos), usamos
  // uma abordagem de "resultado cacheado": o adapter retorna um Proxy
  // que resolve a promise de forma transparente usando Atomics + SharedArrayBuffer
  // quando disponível, ou emite erro orientando a usar async.
  //
  // Solução pragmática: re-exportar funções async e adaptar os controllers.
  // Os models passam a chamar await db.run/get/all.

  return {
    async run(sql, params = []) {
      const client = await pool.connect();
      try {
        const result = await client.query(convertPlaceholders(convertSql(sql)), params);
        return {
          lastInsertRowid: result.rows[0]?.id || null,
          changes: result.rowCount,
        };
      } finally { client.release(); }
    },
    async get(sql, params = []) {
      const client = await pool.connect();
      try {
        const result = await client.query(convertPlaceholders(convertSql(sql)), params);
        return result.rows[0] || null;
      } finally { client.release(); }
    },
    async all(sql, params = []) {
      const client = await pool.connect();
      try {
        const result = await client.query(convertPlaceholders(convertSql(sql)), params);
        return result.rows;
      } finally { client.release(); }
    },
    async exec(sql) {
      const client = await pool.connect();
      try {
        // Divide por ; e executa cada statement
        const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
        for (const stmt of statements) {
          await client.query(convertSql(stmt));
        }
      } finally { client.release(); }
    },
    type: 'postgres',
    pool,
  };
}

/* ─────────────────────────────────────────────
   Exporta o adapter correto
───────────────────────────────────────────── */
function getDb() {
  if (!adapter) {
    adapter = process.env.DATABASE_URL
      ? makePgAdapter()
      : makeSqliteAdapter();
  }
  return adapter;
}

module.exports = { getDb };
