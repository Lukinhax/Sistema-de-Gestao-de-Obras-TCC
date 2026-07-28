const pool = require('../config/database'); // Supondo que você exporte o pool/client daqui

/**
 * Representa a tabela `projeto_etapa` (Estrutura Analítica do Projeto - EDT)
 */
class EtapaModel {
    constructor({
        id_etapa, id_projeto, codigo_edt, nome_tarefa, peso_financeiro,
        status_farol, duracao_dias, 
        data_inicio_planejada, data_fim_planejada, 
        data_inicio_real, data_fim_real,
        execucao_real_perc
    }) {
        this.id_etapa = id_etapa;
        this.id_projeto = id_projeto;
        this.codigo_edt = codigo_edt;
        this.nome_tarefa = nome_tarefa;
        this.peso_financeiro = peso_financeiro;
        this.status_farol = status_farol || 'NÃO INICIADA';
        this.duracao_dias = duracao_dias;
        
        // Linha de Base (Planejado)
        this.data_inicio_planejada = data_inicio_planejada;
        this.data_fim_planejada = data_fim_planejada;
        
        // Execução (Real)
        this.data_inicio_real = data_inicio_real;
        this.data_fim_real = data_fim_real;
        this.execucao_real_perc = execucao_real_perc || 0.0;
    }

    // CRUD Básico via DAO
    static async create(etapaData) {
        const {
            id_projeto, codigo_edt, nome_tarefa, peso_financeiro, status_farol,
            duracao_dias, data_inicio_planejada, data_fim_planejada
        } = etapaData;
        
        const query = `
            INSERT INTO projeto_etapa 
            (id_projeto, codigo_edt, nome_tarefa, peso_financeiro, status_farol, duracao_dias, data_inicio_planejada, data_fim_planejada)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [id_projeto, codigo_edt, nome_tarefa, peso_financeiro, status_farol || 'NÃO INICIADA', duracao_dias, data_inicio_planejada, data_fim_planejada];
        
        const { rows } = await pool.query(query, values);
        return new EtapaModel(rows[0]);
    }

    static async findByProjeto(id_projeto) {
        const { rows } = await pool.query(`SELECT * FROM projeto_etapa WHERE id_projeto = $1 ORDER BY codigo_edt ASC`, [id_projeto]);
        return rows.map(row => new EtapaModel(row));
    }

    async updateExecucao(percRealizado, dataFimReal = null) {
        let query = `UPDATE projeto_etapa SET execucao_real_perc = $1`;
        let values = [percRealizado];
        let index = 2;

        if (dataFimReal) {
            query += `, data_fim_real = $${index}`;
            values.push(dataFimReal);
            index++;
        }
        
        if (percRealizado >= 100) {
            query += `, status_farol = $${index}`;
            values.push('CONCLUÍDA');
            index++;
        } else if (percRealizado > 0) {
            query += `, status_farol = $${index}`;
            values.push('EM PROGRESSO');
            index++;
        }

        query += ` WHERE id_etapa = $${index} RETURNING *;`;
        values.push(this.id_etapa);

        const { rows } = await pool.query(query, values);
        Object.assign(this, rows[0]);
        return this;
    }
}

/**
 * Representa a tabela `etapa_dependencia` (Predecessores no Gráfico de Gantt)
 */
class DependenciaModel {
    constructor({ id_dependencia, id_etapa_sucessora, id_etapa_predecessora, tipo_dependencia }) {
        this.id_dependencia = id_dependencia;
        this.id_etapa_sucessora = id_etapa_sucessora;
        this.id_etapa_predecessora = id_etapa_predecessora;
        this.tipo_dependencia = tipo_dependencia;
    }

    static async create(id_etapa_sucessora, id_etapa_predecessora, tipo_dependencia = 'Fim-Inicio') {
        const query = `
            INSERT INTO etapa_dependencia (id_etapa_sucessora, id_etapa_predecessora, tipo_dependencia) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const { rows } = await pool.query(query, [id_etapa_sucessora, id_etapa_predecessora, tipo_dependencia]);
        return new DependenciaModel(rows[0]);
    }
}

/**
 * Representa a tabela `cargo`
 */
class CargoModel {
    constructor({ id_cargo, nome_cargo, nivel_hierarquico, id_empresa }) {
        this.id_cargo = id_cargo;
        this.nome_cargo = nome_cargo;
        this.nivel_hierarquico = nivel_hierarquico;
        this.id_empresa = id_empresa;
    }

    static async create(nome_cargo, nivel_hierarquico, id_empresa) {
        const { rows } = await pool.query(
            `INSERT INTO cargo (nome_cargo, nivel_hierarquico, id_empresa) VALUES ($1, $2, $3) RETURNING *`,
            [nome_cargo, nivel_hierarquico, id_empresa]
        );
        return new CargoModel(rows[0]);
    }
}

/**
 * Atualização da abstração para Trabalhador
 */
class TrabalhadorModel {
    constructor({ id_trabalhador, nome_trabalhador, telefone_trabalhador, custo_diario, tipo_vinculo, id_cargo, id_empresa }) {
        this.id_trabalhador = id_trabalhador;
        this.nome_trabalhador = nome_trabalhador;
        this.telefone_trabalhador = telefone_trabalhador;
        this.custo_diario = custo_diario; // Valor cobrado (R$/dia)
        this.tipo_vinculo = tipo_vinculo; // 'Fixo' ou 'Sob Demanda'
        this.id_cargo = id_cargo;
        this.id_empresa = id_empresa;
    }

    static async getById(id) {
        const { rows } = await pool.query(`SELECT * FROM trabalhador WHERE id_trabalhador = $1`, [id]);
        return rows[0] ? new TrabalhadorModel(rows[0]) : null;
    }
}

/**
 * Representa a tabela `etapa_alocacao_trabalhador`
 */
class AlocacaoMaoObraModel {
    constructor({ id_alocacao, id_etapa, id_trabalhador, dias_alocados, data_inicio_alocacao, data_fim_alocacao }) {
        this.id_alocacao = id_alocacao;
        this.id_etapa = id_etapa;
        this.id_trabalhador = id_trabalhador;
        this.dias_alocados = dias_alocados;
        this.data_inicio_alocacao = data_inicio_alocacao;
        this.data_fim_alocacao = data_fim_alocacao;
    }

    static async create(alocacaoData) {
        const { id_etapa, id_trabalhador, dias_alocados, data_inicio_alocacao, data_fim_alocacao } = alocacaoData;
        const query = `
            INSERT INTO etapa_alocacao_trabalhador 
            (id_etapa, id_trabalhador, dias_alocados, data_inicio_alocacao, data_fim_alocacao) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const { rows } = await pool.query(query, [id_etapa, id_trabalhador, dias_alocados, data_inicio_alocacao, data_fim_alocacao]);
        return new AlocacaoMaoObraModel(rows[0]);
    }

    /**
     * Calcula o custo financeiro desta alocação.
     * Custo Realizado = dias_alocados * custo_diario do Trabalhador
     */
    async calcularCustoAlocacao() {
        const trabalhador = await TrabalhadorModel.getById(this.id_trabalhador);
        if (!trabalhador) return 0;
        return Number(this.dias_alocados) * Number(trabalhador.custo_diario);
    }
}

module.exports = {
    EtapaModel,
    DependenciaModel,
    CargoModel,
    TrabalhadorModel,
    AlocacaoMaoObraModel
};
