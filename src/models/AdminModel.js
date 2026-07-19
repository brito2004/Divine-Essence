/**
 * Model: Admin — async
 */
const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminModel {
  static async buscarPorEmail(email) {
    return getDb().get('SELECT * FROM admins WHERE email = ?', [email]);
  }
  static async buscarPorId(id) {
    return getDb().get('SELECT id, nome, email, created_at FROM admins WHERE id = ?', [id]);
  }
  static async verificarCredenciais(email, senha) {
    const admin = await this.buscarPorEmail(email);
    if (!admin) return null;
    const ok = await bcrypt.compare(senha, admin.senha_hash);
    if (!ok) return null;
    const { senha_hash, ...sem } = admin;
    return sem;
  }
  static async atualizarSenha(id, novaSenha) {
    const hash = await bcrypt.hash(novaSenha, 12);
    return (await getDb().run('UPDATE admins SET senha_hash = ? WHERE id = ?', [hash, id])).changes > 0;
  }
}

module.exports = AdminModel;
