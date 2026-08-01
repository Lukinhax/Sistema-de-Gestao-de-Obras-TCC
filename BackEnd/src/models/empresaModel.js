const pool = require("../config/database");

class EmpresaModel {
  static async create(empresaData) {
    const { nome_empresa, email, n_telefone, cnpj, senha_hash } = empresaData;
    
    const query = `
      INSERT INTO empresa (nome_empresa, email, n_telefone, cnpj, senha_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_empresa, nome_empresa, email, n_telefone, cnpj;
    `;
    
    const values = [nome_empresa, email, n_telefone, cnpj, senha_hash];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM empresa WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByCnpj(cnpj) {
    const query = `SELECT * FROM empresa WHERE cnpj = $1`;
    const result = await pool.query(query, [cnpj]);
    return result.rows[0];
  }

  static async findById(id_empresa) {
    const query = `SELECT id_empresa, nome_empresa, email FROM empresa WHERE id_empresa = $1`;
    const result = await pool.query(query, [id_empresa]);
    return result.rows[0];
  }
}

module.exports = EmpresaModel;
