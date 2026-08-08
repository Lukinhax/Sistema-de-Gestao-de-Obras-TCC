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
    const { nome_usuario, permissoes, senha_hash, email } = updateData;
    const query = `
      UPDATE funcionario_usuario 
      SET 
        nome_usuario = COALESCE($1, nome_usuario),
        permissoes = COALESCE($2, permissoes),
        senha_hash = COALESCE($3, senha_hash),
        email = COALESCE($4, email)
      WHERE id_funcionario = $5 AND id_empresa = $6
      RETURNING id_funcionario, nome_usuario, email, permissoes;
    `;
    // pg driver doesn't support undefined, so convert undefined to null
    const params = [
      nome_usuario !== undefined ? nome_usuario : null, 
      permissoes !== undefined ? permissoes : null, 
      senha_hash !== undefined ? senha_hash : null, 
      email !== undefined ? email : null, 
      id_funcionario, 
      id_empresa
    ];
    const result = await pool.query(query, params);
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
