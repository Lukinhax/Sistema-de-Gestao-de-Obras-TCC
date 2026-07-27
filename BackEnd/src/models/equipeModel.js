const pool = require("../config/database");

class EquipeModel {
  static async create(equipeData) {
    const { nome_equipe, descricao, id_empresa } = equipeData;
    
    const query = `
      INSERT INTO equipe (nome_equipe, descricao, id_empresa)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const values = [nome_equipe, descricao || null, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmpresa(id_empresa) {
    // Busca todas as equipes e, para cada equipe, agrega seus membros
    const query = `
      SELECT 
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id_trabalhador', t.id_trabalhador,
              'nome_trabalhador', t.nome_trabalhador,
              'telefone_trabalhador', t.telefone_trabalhador,
              'custo_diario', t.custo_diario
            )
          ) FILTER (WHERE t.id_trabalhador IS NOT NULL), 
          '[]'
        ) AS trabalhadores,
        COALESCE(SUM(t.custo_diario), 0) AS custo_diario_total
      FROM equipe e
      LEFT JOIN equipe_trabalhador et ON e.id_equipe = et.id_equipe
      LEFT JOIN trabalhador t ON et.id_trabalhador = t.id_trabalhador
      WHERE e.id_empresa = $1
      GROUP BY e.id_equipe
      ORDER BY e.nome_equipe ASC
    `;
    const result = await pool.query(query, [id_empresa]);
    return result.rows;
  }

  static async update(id_equipe, id_empresa, equipeData) {
    const { nome_equipe, descricao } = equipeData;

    const query = `
      UPDATE equipe 
      SET 
        nome_equipe = COALESCE($1, nome_equipe),
        descricao = COALESCE($2, descricao)
      WHERE id_equipe = $3 AND id_empresa = $4
      RETURNING *;
    `;

    const values = [nome_equipe, descricao, id_equipe, id_empresa];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id_equipe, id_empresa) {
    const query = `
      DELETE FROM equipe 
      WHERE id_equipe = $1 AND id_empresa = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_equipe, id_empresa]);
    return result.rows[0];
  }

  // --- MÉTODOS PIVÔ: EQUIPE x TRABALHADOR ---

  static async addTrabalhador(id_equipe, id_trabalhador) {
    // Aqui assumimos que a validação de empresa foi feita no controller
    const query = `
      INSERT INTO equipe_trabalhador (id_equipe, id_trabalhador)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [id_equipe, id_trabalhador]);
    return result.rows[0];
  }

  static async removeTrabalhador(id_equipe, id_trabalhador) {
    const query = `
      DELETE FROM equipe_trabalhador 
      WHERE id_equipe = $1 AND id_trabalhador = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_equipe, id_trabalhador]);
    return result.rows[0];
  }
}

module.exports = EquipeModel;
