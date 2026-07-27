const pool = require("../config/database");

class AlocacaoModel {
  // ============================
  // RECURSOS (ESTOQUE -> OBRA)
  // ============================

  static async addRecurso(id_projeto, id_recurso, quantidade_projeto, id_empresa) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Verifica se o recurso existe e pertence à empresa
      const recResult = await client.query('SELECT * FROM recurso WHERE id_recurso = $1 AND id_empresa = $2', [id_recurso, id_empresa]);
      if (recResult.rows.length === 0) throw new Error("Recurso não encontrado ou acesso negado.");
      
      const recurso = recResult.rows[0];
      if (recurso.quantidade < quantidade_projeto) throw new Error("Quantidade insuficiente no estoque.");

      // 2. Cria a relação projeto_recurso (faz upsert)
      const insertRel = `
        INSERT INTO projeto_recurso (id_projeto, id_recurso, quantidade_projeto) 
        VALUES ($1, $2, $3)
        ON CONFLICT (id_projeto, id_recurso) 
        DO UPDATE SET quantidade_projeto = projeto_recurso.quantidade_projeto + $3
        RETURNING *;
      `;
      const result = await client.query(insertRel, [id_projeto, id_recurso, quantidade_projeto]);

      // 3. Dá baixa no estoque global (recurso)
      await client.query('UPDATE recurso SET quantidade = quantidade - $1 WHERE id_recurso = $2', [quantidade_projeto, id_recurso]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getRecursosByProjeto(id_projeto, id_empresa) {
    const query = `
      SELECT r.id_recurso, r.nome, r.tipo, r.custo_unitario, pr.quantidade_projeto, (r.custo_unitario * pr.quantidade_projeto) as custo_total
      FROM projeto_recurso pr
      JOIN recurso r ON pr.id_recurso = r.id_recurso
      JOIN projeto p ON pr.id_projeto = p.id_projeto
      WHERE pr.id_projeto = $1 AND p.id_empresa = $2
    `;
    const result = await pool.query(query, [id_projeto, id_empresa]);
    return result.rows;
  }

  static async removeRecurso(id_projeto, id_recurso, id_empresa) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Pega a quantidade que estava alocada para devolver ao estoque
      const prResult = await client.query('SELECT quantidade_projeto FROM projeto_recurso WHERE id_projeto = $1 AND id_recurso = $2', [id_projeto, id_recurso]);
      if (prResult.rows.length === 0) throw new Error("Alocação não encontrada.");
      const qtd_devolver = prResult.rows[0].quantidade_projeto;

      // Remove da obra
      await client.query('DELETE FROM projeto_recurso WHERE id_projeto = $1 AND id_recurso = $2', [id_projeto, id_recurso]);

      // Devolve para o estoque (assumindo que o recurso ainda existe)
      await client.query('UPDATE recurso SET quantidade = quantidade + $1 WHERE id_recurso = $2', [qtd_devolver, id_recurso]);

      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // ============================
  // EQUIPES (MÃO DE OBRA -> OBRA)
  // ============================

  static async addEquipe(id_projeto, id_equipe, data_inicio, data_fim, id_empresa) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Cria a entidade mao_de_obra que representa este "contrato/alocação"
      const insertMaoObra = `
        INSERT INTO mao_de_obra (data_inicio, data_fim, id_empresa)
        VALUES ($1, $2, $3) RETURNING id_mao_obra;
      `;
      const mObraResult = await client.query(insertMaoObra, [data_inicio, data_fim, id_empresa]);
      const id_mao_obra = mObraResult.rows[0].id_mao_obra;

      // 2. Vincula a mao_de_obra ao projeto
      await client.query('INSERT INTO projeto_mao_obra (id_projeto, id_mao_obra) VALUES ($1, $2)', [id_projeto, id_mao_obra]);

      // 3. Vincula a mao_de_obra à equipe escolhida
      await client.query('INSERT INTO mao_obra_equipe (id_mao_obra, id_equipe) VALUES ($1, $2)', [id_mao_obra, id_equipe]);

      await client.query('COMMIT');
      return { id_mao_obra, id_projeto, id_equipe, data_inicio, data_fim };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getEquipesByProjeto(id_projeto, id_empresa) {
    const query = `
      SELECT 
        mo.id_mao_obra, mo.data_inicio, mo.data_fim,
        e.id_equipe, e.nome_equipe,
        -- Custo diário da equipe
        COALESCE((
          SELECT SUM(t.custo_diario)
          FROM equipe_trabalhador et
          JOIN trabalhador t ON et.id_trabalhador = t.id_trabalhador
          WHERE et.id_equipe = e.id_equipe
        ), 0) AS custo_diario_equipe,
        -- Membros agrupados
        COALESCE((
          SELECT json_agg(json_build_object('id_trabalhador', t.id_trabalhador, 'nome_trabalhador', t.nome_trabalhador, 'custo_diario', t.custo_diario))
          FROM equipe_trabalhador et
          JOIN trabalhador t ON et.id_trabalhador = t.id_trabalhador
          WHERE et.id_equipe = e.id_equipe
        ), '[]') AS membros
      FROM projeto_mao_obra pmo
      JOIN mao_de_obra mo ON pmo.id_mao_obra = mo.id_mao_obra
      JOIN mao_obra_equipe moe ON mo.id_mao_obra = moe.id_mao_obra
      JOIN equipe e ON moe.id_equipe = e.id_equipe
      WHERE pmo.id_projeto = $1 AND mo.id_empresa = $2
    `;
    const result = await pool.query(query, [id_projeto, id_empresa]);
    return result.rows;
  }

  static async removeMaoObra(id_mao_obra, id_empresa) {
    // Como tem ON DELETE CASCADE, deletar a mao_de_obra irá deletar das tabelas projeto_mao_obra e mao_obra_equipe
    const query = `DELETE FROM mao_de_obra WHERE id_mao_obra = $1 AND id_empresa = $2 RETURNING *`;
    const result = await pool.query(query, [id_mao_obra, id_empresa]);
    return result.rows[0];
  }
}

module.exports = AlocacaoModel;
