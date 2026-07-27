const pool = require("../config/database");

class FuncionarioModel {
  static async create(funcionarioData) {
    const { nome_usuario, email, senha_hash, permissoes, id_empresa } = funcionarioData;
    
    const query = `
      INSERT INTO funcionario_usuario (nome_usuario, email, senha_hash, permissoes, id_empresa)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id_funcionario, nome_usuario, email, permissoes, id_empresa;
    `;
    
    const values = [nome_usuario, email, senha_hash, permissoes, id_empresa];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `SELECT * FROM funcionario_usuario WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByEmpresa(id_empresa) {
    const query = `
      SELECT id_funcionario, nome_usuario, email, permissoes 
      FROM funcionario_usuario 
      WHERE id_empresa = $1 
      ORDER BY id_funcionario DESC
    `;
    const result = await pool.query(query, [id_empresa]);
    return result.rows;
  }

  static async update(id_funcionario, id_empresa, updateData) {
    const { nome_usuario, permissoes } = updateData;
    const query = `
      UPDATE funcionario_usuario 
      SET 
        nome_usuario = COALESCE($1, nome_usuario),
        permissoes = COALESCE($2, permissoes)
      WHERE id_funcionario = $3 AND id_empresa = $4
      RETURNING id_funcionario, nome_usuario, email, permissoes;
    `;
    const result = await pool.query(query, [nome_usuario, permissoes, id_funcionario, id_empresa]);
    return result.rows[0];
  }

  static async delete(id_funcionario, id_empresa) {
    const query = `
      DELETE FROM funcionario_usuario 
      WHERE id_funcionario = $1 AND id_empresa = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_funcionario, id_empresa]);
    return result.rows[0];
  }
}

module.exports = FuncionarioModel;
