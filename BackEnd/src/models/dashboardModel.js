const pool = require("../config/database");

class DashboardModel {
  static async getStats(id_empresa, filtros = {}) {
    const client = await pool.connect();
    
    try {
      const { status, dataInicio, dataFim } = filtros;
      
      let whereP = `WHERE id_empresa = $1`;
      let whereAliasP = `WHERE p.id_empresa = $1`;
      let params = [id_empresa];
      let pIdx = 2;

      if (status) {
        whereP += ` AND status_projeto = $${pIdx}`;
        whereAliasP += ` AND p.status_projeto = $${pIdx}`;
        params.push(status);
        pIdx++;
      }
      if (dataInicio) {
        whereP += ` AND data_inicio >= $${pIdx}`;
        whereAliasP += ` AND p.data_inicio >= $${pIdx}`;
        params.push(dataInicio);
        pIdx++;
      }
      if (dataFim) {
        whereP += ` AND data_inicio <= $${pIdx}`;
        whereAliasP += ` AND p.data_inicio <= $${pIdx}`;
        params.push(dataFim + ' 23:59:59');
        pIdx++;
      }

      // 1. Total de projetos
      const resProjetos = await client.query(`SELECT COUNT(*) as total FROM projeto ${whereP}`, params);
      
      // 2. Projetos em andamento
      let andamentoParams = [...params];
      let andamentoWhere = whereP + ` AND status_projeto = 'Em Andamento'`;
      const resAndamento = await client.query(`SELECT COUNT(*) as total FROM projeto ${andamentoWhere}`, andamentoParams);
      
      // 3. Total Orçamento
      const resOrcamento = await client.query(`SELECT COALESCE(SUM(orcamento_total), 0) as total FROM projeto ${whereP}`, params);
      
      // 4. Total Gasto (Custos)
      const resCustos = await client.query(`
        SELECT COALESCE(SUM(c.valor), 0) as total 
        FROM custo c
        JOIN projeto p ON c.id_projeto = p.id_projeto
        ${whereAliasP}
      `, params);

      // 5. Total de Trabalhadores Ativos
      const resTrabalhadores = await client.query(`SELECT COUNT(*) as total FROM trabalhador WHERE id_empresa = $1`, [id_empresa]);

      // 5.1 Valor em Estoque
      const resEstoque = await client.query(`
        SELECT COALESCE(SUM(quantidade * custo_unitario), 0) as total 
        FROM recurso WHERE id_empresa = $1
      `, [id_empresa]);

      // 6. Custo por projeto
      const resGraficoCustos = await client.query(`
        SELECT 
          p.id_projeto, 
          p.nome_projeto, 
          p.orcamento_total,
          COALESCE(SUM(c.valor), 0) as custo_realizado
        FROM projeto p
        LEFT JOIN custo c ON p.id_projeto = c.id_projeto
        ${whereAliasP}
        GROUP BY p.id_projeto, p.nome_projeto, p.orcamento_total
        ORDER BY p.id_projeto DESC
        LIMIT 5
      `, params);

      // 7. Gráfico Pizza: Status Obras
      const resStatusDist = await client.query(`
        SELECT status_projeto as name, COUNT(*) as value 
        FROM projeto 
        ${whereP}
        GROUP BY status_projeto
      `, params);

      // 8. Gráfico Especialidades (Coluna não existe atualmente, retornando vazio)
      const resEspecialidades = { rows: [] };

      return {
        totalProjetos: parseInt(resProjetos.rows[0].total),
        projetosEmAndamento: parseInt(resAndamento.rows[0].total),
        orcamentoTotal: parseFloat(resOrcamento.rows[0].total),
        custoTotal: parseFloat(resCustos.rows[0].total),
        totalTrabalhadores: parseInt(resTrabalhadores.rows[0].total),
        valorEstoque: parseFloat(resEstoque.rows[0].total),
        graficoCustos: resGraficoCustos.rows.map(row => ({
          nome_projeto: row.nome_projeto,
          orcamento_total: parseFloat(row.orcamento_total),
          custo_realizado: parseFloat(row.custo_realizado)
        })),
        graficoStatus: resStatusDist.rows.map(r => ({ name: r.name || 'Sem Status', value: parseInt(r.value) })),
        graficoEspecialidades: resEspecialidades.rows.map(r => ({ name: r.name || 'Sem Especialidade', value: parseInt(r.value) }))
      };
    } finally {
      client.release();
    }
  }
}

module.exports = DashboardModel;
