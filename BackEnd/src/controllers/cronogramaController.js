const { EtapaModel } = require('../models/CronogramaModels');
const pool = require('../config/db');

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
        const { execucao_real_perc, data_fim_real } = req.body;
        
        // Find stage to instantiate model
        const { rows } = await pool.query(`SELECT * FROM projeto_etapa WHERE id_etapa = $1`, [id_etapa]);
        if (rows.length === 0) return res.status(404).json({ message: 'Etapa não encontrada.' });
        
        const etapa = new EtapaModel(rows[0]);
        const etapaAtualizada = await etapa.updateExecucao(execucao_real_perc, data_fim_real);
        
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
        
        // Algoritmo simples de Curva S: 
        // Agrupar por data de término planejada para a curva de planejamento
        // Agrupar por data atual/fim real para a curva realizada.
        // Como é um MVP, vamos gerar pontos diários ou por evento
        let timeline = [];
        
        // Coleta todas as datas únicas de planejamento
        const datasPlanejadas = [...new Set(etapas.map(e => e.data_fim_planejada ? new Date(e.data_fim_planejada).toISOString().split('T')[0] : null).filter(d=>d))];
        datasPlanejadas.sort();

        let planejadoAcumulado = 0;
        let realizadoAcumulado = 0;

        // Calcula o acumulado por data marco
        const pontosCurva = datasPlanejadas.map(dataMarco => {
            const dataMarcoDate = new Date(dataMarco);
            
            // Soma peso das etapas que deveriam estar prontas até essa data
            let somaPlanejada = 0;
            // Soma peso executado real de TODAS as etapas até o momento dessa consulta
            // No mundo real, a curva S real seria plotada no eixo do tempo também
            let somaRealizada = 0;

            etapas.forEach(e => {
                const fimPlan = new Date(e.data_fim_planejada);
                if (fimPlan <= dataMarcoDate) {
                    somaPlanejada += Number(e.peso_financeiro) || 0;
                }
                
                // Aproximação do realizado: pega o % concluído * peso total, mas distribuído na linha do tempo
                // Se a etapa terminou antes do marco, considera 100% (ou a execucao real * peso)
                if (e.data_fim_real) {
                    const fimReal = new Date(e.data_fim_real);
                    if (fimReal <= dataMarcoDate) {
                        somaRealizada += (Number(e.execucao_real_perc) / 100) * Number(e.peso_financeiro);
                    }
                } else {
                    // Se não tem data fim real, assume que o % atual vale pro dia de hoje.
                    // Para o gráfico histórico, isso é uma aproximação.
                    const hoje = new Date();
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
