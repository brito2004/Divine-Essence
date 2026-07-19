/**
 * Model: Categoria — async, compatível com SQLite e PostgreSQL
 */
const { getDb } = require('../config/database');

class CategoriaModel {
  static async buscarTodas() {
    return getDb().all('SELECT * FROM categorias ORDER BY nome ASC', []);
  }
  static async buscarPorId(id) {
    return getDb().get('SELECT * FROM categorias WHERE id = ?', [id]);
  }
  static async buscarPorNome(nome) {
    return getDb().get('SELECT * FROM categorias WHERE nome = ?', [nome]);
  }
  static async criar(dados) {
    const db = getDb();
    const isPg = db.type === 'postgres';
    const sql = isPg
      ? 'INSERT INTO categorias (nome, descricao) VALUES (?,?) RETURNING id'
      : 'INSERT INTO categorias (nome, descricao) VALUES (?,?)';
    const r = await db.run(sql, [dados.nome, dados.descricao || '']);
    return this.buscarPorId(r.lastInsertRowid);
  }
  static async atualizar(id, dados) {
    await getDb().run('UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?',
      [dados.nome, dados.descricao || '', id]);
    return this.buscarPorId(id);
  }
  static async excluir(id) {
    const db = getDb();
    const cat = await this.buscarPorId(id);
    if (!cat) return false;
    const row = await db.get('SELECT COUNT(*) as total FROM produtos WHERE categoria = ?', [cat.nome]);
    const total = parseInt(row.total || row.count || 0);
    if (total > 0) throw new Error(`Não é possível excluir: ${total} produto(s) vinculado(s)`);
    return (await db.run('DELETE FROM categorias WHERE id = ?', [id])).changes > 0;
  }
  static async listarNomes() {
    const rows = await getDb().all('SELECT nome FROM categorias ORDER BY nome ASC', []);
    return rows.map(c => c.nome);
  }
}

module.exports = CategoriaModel;
