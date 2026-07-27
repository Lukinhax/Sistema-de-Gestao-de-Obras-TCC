const pool = require("../config/database");

class MaoDeObraModel {
  static async allocateEquipe(maoDeObraData) {
    const { data_inicio, data_fim, id_equipe, id_projeto, id_empresa } = maoDeObraData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 1. Criar o registro de mao de obra
      const insertMaoDeObra = `
        INSERT INTO mao_de_obra (data_inicio, data_fim, id_empresa)
        VALUES ($1, $2, $3)
        RETURNING id_mao_obra;
      `;
      const resMaoDeObra = await client.query(insertMaoDeObra, [data_inicio, data_fim, id_empresa]);
      const id_mao_obra = resMaoDeObra.rows[0].id_mao_obra;

      // 2. Ligar com a equipe
      const insertMaoObraEquipe = `
        INSERT INTO mao_obra_equipe (id_mao_obra, id_equipe)
        VALUES ($1, $2);
      `;
      await client.query(insertMaoObraEquipe, [id_mao_obra, id_equipe]);

      // 3. Ligar com o projeto
      const insertProjetoMaoObra = `
        INSERT INTO projeto_mao_obra (id_projeto, id_mao_obra)
        VALUES ($1, $2);
      `;
      await client.query(insertProjetoMaoObra, [id_projeto, id_mao_obra]);

      await client.query('COMMIT');
      return id_mao_obra;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findByProjeto(id_projeto, id_empresa) {
    const query = `
      SELECT 
        m.id_mao_obra,
        m.data_inicio,
        m.data_fim,
        e.id_equipe,
        e.nome_equipe
      FROM projeto_mao_obra pm
      JOIN mao_de_obra m ON pm.id_mao_obra = m.id_mao_obra
      JOIN mao_obra_equipe me ON m.id_mao_obra = me.id_mao_obra
      JOIN equipe e ON me.id_equipe = e.id_equipe
      WHERE pm.id_projeto = $1 AND m.id_empresa = $2
      ORDER BY m.data_inicio ASC
    `;
    const result = await pool.query(query, [id_projeto, id_empresa]);
    return result.rows;
  }

  static async removeAllocation(id_mao_obra, id_empresa) {
    // A tabela mao_de_obra tem ON DELETE CASCADE para mao_obra_equipe e projeto_mao_obra
    const query = `
      DELETE FROM mao_de_obra
      WHERE id_mao_obra = $1 AND id_empresa = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id_mao_obra, id_empresa]);
    return result.rows[0];
  }
}

module.exports = MaoDeObraModel;
