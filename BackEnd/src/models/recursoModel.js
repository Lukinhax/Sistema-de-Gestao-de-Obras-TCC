const pool = require("../config/database");

class RecursoModel {
  static async create(recursoData) {
    const { nome, tipo, quantidade, custo_unitario, id_empresa } = recursoData;
    
    const query = `
      INSERT INTO recurso (nome, tipo, quantidade, custo_unitario, id_empresa)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    const values = [nome, tipo || null, quantidade || 0, custo_unitario || 0, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmpresa(id_empresa) {
    const query = `
      SELECT * 
      FROM recurso 
      WHERE id_empresa = $1 
      ORDER BY nome ASC
    `;
    const result = await pool.query(query, [id_empresa]);
    return result.rows;
  }

  static async findById(id_recurso, id_empresa) {
    const query = `
      SELECT * 
      FROM recurso 
      WHERE id_recurso = $1 AND id_empresa = $2
    `;
    const result = await pool.query(query, [id_recurso, id_empresa]);
    return result.rows[0];
  }

  static async update(id_recurso, id_empresa, recursoData) {
    const { nome, tipo, quantidade, custo_unitario } = recursoData;

    const query = `
      UPDATE recurso 
      SET 
        nome = COALESCE($1, nome),
        tipo = COALESCE($2, tipo),
        quantidade = COALESCE($3, quantidade),
        custo_unitario = COALESCE($4, custo_unitario)
      WHERE id_recurso = $5 AND id_empresa = $6
      RETURNING *;
    `;

    const values = [nome, tipo, quantidade, custo_unitario, id_recurso, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id_recurso, id_empresa) {
    const query = `
      DELETE FROM recurso 
      WHERE id_recurso = $1 AND id_empresa = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_recurso, id_empresa]);
    return result.rows[0];
  }
}

module.exports = RecursoModel;
