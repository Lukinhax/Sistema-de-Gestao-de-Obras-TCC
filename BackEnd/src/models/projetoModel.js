const pool = require("../config/database");

class ProjetoModel {
  static async create(projetoData) {
    const { 
      nome_projeto, 
      descricao_projeto, 
      data_inicio, 
      data_fim, 
      status_projeto, 
      orcamento_total, 
      id_empresa 
    } = projetoData;
    
    const query = `
      INSERT INTO projeto (nome_projeto, descricao_projeto, data_inicio, data_fim, status_projeto, orcamento_total, id_empresa)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [nome_projeto, descricao_projeto, data_inicio, data_fim, status_projeto, orcamento_total, id_empresa];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmpresa(id_empresa) {
    const query = `
      SELECT * 
      FROM projeto 
      WHERE id_empresa = $1 
      ORDER BY id_projeto DESC
    `;
    const result = await pool.query(query, [id_empresa]);
    return result.rows;
  }

  static async findById(id_projeto, id_empresa) {
    const query = `
      SELECT * 
      FROM projeto 
      WHERE id_projeto = $1 AND id_empresa = $2
    `;
    const result = await pool.query(query, [id_projeto, id_empresa]);
    return result.rows[0];
  }

  static async update(id_projeto, id_empresa, projetoData) {
    const { 
      nome_projeto, 
      descricao_projeto, 
      data_inicio, 
      data_fim, 
      status_projeto, 
      orcamento_total 
    } = projetoData;

    const query = `
      UPDATE projeto 
      SET 
        nome_projeto = COALESCE($1, nome_projeto),
        descricao_projeto = COALESCE($2, descricao_projeto),
        data_inicio = COALESCE($3, data_inicio),
        data_fim = COALESCE($4, data_fim),
        status_projeto = COALESCE($5, status_projeto),
        orcamento_total = COALESCE($6, orcamento_total)
      WHERE id_projeto = $7 AND id_empresa = $8
      RETURNING *;
    `;

    const values = [
      nome_projeto, 
      descricao_projeto, 
      data_inicio, 
      data_fim, 
      status_projeto, 
      orcamento_total,
      id_projeto,
      id_empresa
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id_projeto, id_empresa) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Devolver materiais alocados para o estoque
      const recursosAlocados = await client.query('SELECT id_recurso, quantidade_projeto FROM projeto_recurso WHERE id_projeto = $1', [id_projeto]);
      for (const rec of recursosAlocados.rows) {
        await client.query('UPDATE recurso SET quantidade = quantidade + $1 WHERE id_recurso = $2', [rec.quantidade_projeto, rec.id_recurso]);
      }

      // 2. Apagar o projeto (as relações filhas sumirão via ON DELETE CASCADE)
      const query = `
        DELETE FROM projeto 
        WHERE id_projeto = $1 AND id_empresa = $2
        RETURNING *;
      `;
      const result = await client.query(query, [id_projeto, id_empresa]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch(e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async toggleFavorito(id_projeto, id_empresa) {
    const query = `
      UPDATE projeto 
      SET is_favorito = NOT is_favorito 
      WHERE id_projeto = $1 AND id_empresa = $2 
      RETURNING is_favorito;
    `;
    const result = await pool.query(query, [id_projeto, id_empresa]);
    return result.rows[0];
  }
}

module.exports = ProjetoModel;
