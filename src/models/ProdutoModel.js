/**
 * Model: Produto — compatível com SQLite e PostgreSQL
 */
const { getDb } = require('../config/database');

class ProdutoModel {
  static async buscarTodos(filtros = {}) {
    const db = getDb();
    let query = 'SELECT * FROM produtos WHERE 1=1';
    const params = [];

    if (filtros.categoria && filtros.categoria !== 'todas') {
      query += ' AND categoria = ?'; params.push(filtros.categoria);
    }
    if (filtros.busca) {
      query += ' AND (nome LIKE ? OR descricao LIKE ? OR categoria LIKE ?)';
      const t = `%${filtros.busca}%`; params.push(t, t, t);
    }
    if (filtros.destaque) { query += ' AND destaque = 1'; }

    switch (filtros.ordenacao) {
      case 'preco_asc':  query += ' ORDER BY preco ASC';  break;
      case 'preco_desc': query += ' ORDER BY preco DESC'; break;
      case 'nome_asc':   query += ' ORDER BY nome ASC';   break;
      default:           query += ' ORDER BY created_at DESC';
    }
    return db.all(query, params);
  }

  static async buscarPorId(id) {
    return getDb().get('SELECT * FROM produtos WHERE id = ?', [id]);
  }

  static async criar(dados) {
    const db = getDb();
    // PostgreSQL precisa de RETURNING id para obter o lastInsertRowid
    const isPg = db.type === 'postgres';
    const sql = isPg
      ? `INSERT INTO produtos (nome,descricao,preco,categoria,imagem,destaque) VALUES (?,?,?,?,?,?) RETURNING id`
      : `INSERT INTO produtos (nome,descricao,preco,categoria,imagem,destaque) VALUES (?,?,?,?,?,?)`;

    const result = await db.run(sql, [
      dados.nome, dados.descricao || '', parseFloat(dados.preco),
      dados.categoria, dados.imagem || 'placeholder.svg', dados.destaque ? 1 : 0
    ]);
    const id = isPg ? result.lastInsertRowid : result.lastInsertRowid;
    return this.buscarPorId(id);
  }

  static async atualizar(id, dados) {
    const db = getDb();
    const campos = [], valores = [];
    if (dados.nome !== undefined)      { campos.push('nome = ?');      valores.push(dados.nome); }
    if (dados.descricao !== undefined)  { campos.push('descricao = ?'); valores.push(dados.descricao); }
    if (dados.preco !== undefined)      { campos.push('preco = ?');     valores.push(parseFloat(dados.preco)); }
    if (dados.categoria !== undefined)  { campos.push('categoria = ?'); valores.push(dados.categoria); }
    if (dados.imagem !== undefined)     { campos.push('imagem = ?');    valores.push(dados.imagem); }
    if (dados.destaque !== undefined)   { campos.push('destaque = ?');  valores.push(dados.destaque ? 1 : 0); }
    campos.push(db.type === 'postgres' ? "updated_at = NOW()" : "updated_at = datetime('now')");
    valores.push(id);
    await db.run(`UPDATE produtos SET ${campos.join(', ')} WHERE id = ?`, valores);
    return this.buscarPorId(id);
  }

  static async excluir(id) {
    const r = await getDb().run('DELETE FROM produtos WHERE id = ?', [id]);
    return r.changes > 0;
  }

  static async contar(filtros = {}) {
    const db = getDb();
    let query = 'SELECT COUNT(*) as total FROM produtos WHERE 1=1';
    const params = [];
    if (filtros.categoria && filtros.categoria !== 'todas') {
      query += ' AND categoria = ?'; params.push(filtros.categoria);
    }
    if (filtros.destaque) { query += ' AND destaque = 1'; }
    const row = await db.get(query, params);
    return parseInt(row.total || row.count || 0);
  }
}

module.exports = ProdutoModel;
