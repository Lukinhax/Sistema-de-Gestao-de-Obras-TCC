const pool = require("../config/database");

class TrabalhadorModel {
  static async create(trabalhadorData) {
    const { nome_trabalhador, telefone_trabalhador, custo_diario, id_empresa } = trabalhadorData;
    
    const query = `
      INSERT INTO trabalhador (nome_trabalhador, telefone_trabalhador, custo_diario, id_empresa)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [nome_trabalhador, telefone_trabalhador || null, custo_diario || 0, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmpresa(id_empresa) {
    const query = `
      SELECT * 
      FROM trabalhador 
      WHERE id_empresa = $1 
      ORDER BY nome_trabalhador ASC
    `;
    const result = await pool.query(query, [id_empresa]);
    return result.rows;
  }

  static async update(id_trabalhador, id_empresa, trabalhadorData) {
    const { nome_trabalhador, telefone_trabalhador, custo_diario } = trabalhadorData;

    const query = `
      UPDATE trabalhador 
      SET 
        nome_trabalhador = COALESCE($1, nome_trabalhador),
        telefone_trabalhador = COALESCE($2, telefone_trabalhador),
        custo_diario = COALESCE($3, custo_diario)
      WHERE id_trabalhador = $4 AND id_empresa = $5
      RETURNING *;
    `;

    const values = [nome_trabalhador, telefone_trabalhador, custo_diario, id_trabalhador, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id_trabalhador, id_empresa) {
    const query = `
      DELETE FROM trabalhador 
      WHERE id_trabalhador = $1 AND id_empresa = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_trabalhador, id_empresa]);
    return result.rows[0];
  }
}

module.exports = TrabalhadorModel;
