const pool = require("../config/database");

class CustoModel {
  static async create(custoData) {
    const { descricao, valor, data_registro, id_projeto } = custoData;
    
    const query = `
      INSERT INTO custo (descricao, valor, data_registro, id_projeto)
      VALUES ($1, $2, COALESCE($3::date, CURRENT_DATE), $4)
      RETURNING *;
    `;
    
    const values = [descricao, valor, data_registro || null, id_projeto];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByProjeto(id_projeto) {
    const query = `
      SELECT * 
      FROM custo 
      WHERE id_projeto = $1 
      ORDER BY data_registro DESC, id_custo DESC
    `;
    const result = await pool.query(query, [id_projeto]);
    return result.rows;
  }

  static async update(id_custo, custoData) {
    const { descricao, valor, data_registro } = custoData;
    const query = `
      UPDATE custo
      SET
        descricao     = COALESCE($1, descricao),
        valor         = COALESCE($2, valor),
        data_registro = COALESCE($3::date, data_registro)
      WHERE id_custo = $4
      RETURNING *;
    `;
    const values = [
      descricao   || null,
      valor       !== undefined ? valor : null,
      data_registro || null,
      id_custo
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id_custo) {
    const query = `
      DELETE FROM custo 
      WHERE id_custo = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id_custo]);
    return result.rows[0];
  }

  static async sumByProjeto(id_projeto) {
    const query = `
      SELECT COALESCE(SUM(valor), 0) as total_gasto
      FROM custo
      WHERE id_projeto = $1
    `;
    const result = await pool.query(query, [id_projeto]);
    return result.rows[0];
  }
}

module.exports = CustoModel;
