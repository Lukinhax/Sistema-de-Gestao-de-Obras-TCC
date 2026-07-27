const pool = require("../config/database");

class DashboardModel {
  static async getStats(id_empresa) {
    const client = await pool.connect();
    
    try {
      // 1. Total de projetos
      const queryProjetos = `SELECT COUNT(*) as total FROM projeto WHERE id_empresa = $1`;
      const resProjetos = await client.query(queryProjetos, [id_empresa]);
      
      // 2. Projetos em andamento
      const queryAndamento = `SELECT COUNT(*) as total FROM projeto WHERE id_empresa = $1 AND status_projeto = 'Em Andamento'`;
      const resAndamento = await client.query(queryAndamento, [id_empresa]);
      
      // 3. Total Orçamento de todos os projetos
      const queryOrcamento = `SELECT COALESCE(SUM(orcamento_total), 0) as total FROM projeto WHERE id_empresa = $1`;
      const resOrcamento = await client.query(queryOrcamento, [id_empresa]);
      
      // 4. Total Gasto (Custos) de todos os projetos dessa empresa
      const queryCustos = `
        SELECT COALESCE(SUM(c.valor), 0) as total 
        FROM custo c
        JOIN projeto p ON c.id_projeto = p.id_projeto
        WHERE p.id_empresa = $1
      `;
      const resCustos = await client.query(queryCustos, [id_empresa]);

      // 5. Total de Trabalhadores Ativos
      const queryTrabalhadores = `SELECT COUNT(*) as total FROM trabalhador WHERE id_empresa = $1`;
      const resTrabalhadores = await client.query(queryTrabalhadores, [id_empresa]);

      // 6. Custo por projeto (para gráfico)
      const queryGraficoCustos = `
        SELECT 
          p.id_projeto, 
          p.nome_projeto, 
          p.orcamento_total,
          COALESCE(SUM(c.valor), 0) as custo_realizado
        FROM projeto p
        LEFT JOIN custo c ON p.id_projeto = c.id_projeto
        WHERE p.id_empresa = $1
        GROUP BY p.id_projeto, p.nome_projeto, p.orcamento_total
        ORDER BY p.id_projeto DESC
        LIMIT 5
      `;
      const resGraficoCustos = await client.query(queryGraficoCustos, [id_empresa]);

      return {
        totalProjetos: parseInt(resProjetos.rows[0].total),
        projetosEmAndamento: parseInt(resAndamento.rows[0].total),
        orcamentoTotal: parseFloat(resOrcamento.rows[0].total),
        custoTotal: parseFloat(resCustos.rows[0].total),
        totalTrabalhadores: parseInt(resTrabalhadores.rows[0].total),
        graficoCustos: resGraficoCustos.rows.map(row => ({
          nome_projeto: row.nome_projeto,
          orcamento_total: parseFloat(row.orcamento_total),
          custo_realizado: parseFloat(row.custo_realizado)
        }))
      };
    } finally {
      client.release();
    }
  }
}

module.exports = DashboardModel;
