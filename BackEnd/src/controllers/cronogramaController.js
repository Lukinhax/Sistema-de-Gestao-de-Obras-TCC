const { EtapaModel } = require('../models/CronogramaModels');
const pool = require('../config/database');

// Helper: constrói um Date local (sem UTC offset) a partir de string 'YYYY-MM-DD'
function parseLocalDate(str) {
    if (!str) return null;
    const [y, m, d] = String(str).split('-').map(Number);
    return new Date(y, m - 1, d);
}

exports.getEtapas = async (req, res) => {
    try {
        const { id_projeto } = req.params;
        const etapas = await EtapaModel.findByProjeto(id_projeto);
        res.status(200).json(etapas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar etapas.' });
    }
};

exports.criarEtapa = async (req, res) => {
    try {
        const { id_projeto } = req.params;
        const { codigo_edt, nome_tarefa, peso_financeiro, duracao_dias, data_inicio_planejada, data_fim_planejada } = req.body;
        
        const novaEtapa = await EtapaModel.create({
            id_projeto,
            codigo_edt,
            nome_tarefa,
            peso_financeiro,
            duracao_dias,
            data_inicio_planejada,
            data_fim_planejada
        });
        
        res.status(201).json(novaEtapa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar etapa.' });
    }
};

exports.atualizarProgresso = async (req, res) => {
    try {
        const { id_etapa } = req.params;
        const { execucao_real_perc, data_fim_real, nome_tarefa } = req.body;
        
        // Find stage to instantiate model
        const { rows } = await pool.query(`SELECT * FROM projeto_etapa WHERE id_etapa = $1`, [id_etapa]);
        if (rows.length === 0) return res.status(404).json({ message: 'Etapa não encontrada.' });
        
        const etapa = new EtapaModel(rows[0]);
        const etapaAtualizada = await etapa.updateExecucao(execucao_real_perc, data_fim_real, nome_tarefa);
        
        res.status(200).json(etapaAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar progresso.' });
    }
};

exports.getCurvaS = async (req, res) => {
    try {
        const { id_projeto } = req.params;
        const etapas = await EtapaModel.findByProjeto(id_projeto);

        // Coleta todas as datas únicas de fim planejado (já chegam como string 'YYYY-MM-DD')
        const datasPlanejadas = [...new Set(
            etapas
                .map(e => e.data_fim_planejada ? String(e.data_fim_planejada).split('T')[0] : null)
                .filter(d => d)
        )].sort();

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // Calcula o acumulado por data marco
        const pontosCurva = datasPlanejadas.map(dataMarco => {
            const dataMarcoDate = parseLocalDate(dataMarco);

            let somaPlanejada = 0;
            let somaRealizada = 0;

            etapas.forEach(e => {
                const fimPlan = parseLocalDate(e.data_fim_planejada);
                if (fimPlan && fimPlan <= dataMarcoDate) {
                    somaPlanejada += Number(e.peso_financeiro) || 0;
                }

                // Curva realizada: se tem data fim real, usa-a; senão, usa data atual como referência
                if (e.data_fim_real) {
                    const fimReal = parseLocalDate(e.data_fim_real);
                    if (fimReal && fimReal <= dataMarcoDate) {
                        somaRealizada += (Number(e.execucao_real_perc) / 100) * Number(e.peso_financeiro);
                    }
                } else {
                    // Aproximação: o % atual vale para o dia de hoje
                    if (hoje <= dataMarcoDate) {
                        somaRealizada += (Number(e.execucao_real_perc) / 100) * Number(e.peso_financeiro);
                    }
                }
            });

            return {
                data: dataMarco,
                planejado: (somaPlanejada * 100).toFixed(2),
                realizado: (somaRealizada * 100).toFixed(2)
            };
        });

        res.status(200).json(pontosCurva);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao gerar Curva S.' });
    }
};
