const AlocacaoModel = require('../models/alocacaoModel');

// --- RECURSOS ---
exports.addRecurso = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const { id_recurso, quantidade_projeto } = req.body;
    const id_empresa = req.empresaId;

    if (!id_recurso || !quantidade_projeto) return res.status(400).json({ message: 'id_recurso e quantidade são obrigatórios.' });

    const alocacao = await AlocacaoModel.addRecurso(id_projeto, id_recurso, parseInt(quantidade_projeto), id_empresa);
    res.status(201).json(alocacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Erro ao alocar recurso.' });
  }
};

exports.getRecursos = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const id_empresa = req.empresaId;
    const recursos = await AlocacaoModel.getRecursosByProjeto(id_projeto, id_empresa);
    res.json(recursos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar recursos da obra.' });
  }
};

exports.removeRecurso = async (req, res) => {
  try {
    const { id_projeto, id_recurso } = req.params;
    const id_empresa = req.empresaId;
    
    await AlocacaoModel.removeRecurso(id_projeto, id_recurso, id_empresa);
    res.json({ message: 'Recurso removido da obra e devolvido ao estoque.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Erro ao remover recurso.' });
  }
};

// --- EQUIPES (MÃO DE OBRA) ---
exports.addEquipe = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const { id_equipe, data_inicio, data_fim } = req.body;
    const id_empresa = req.empresaId;

    if (!id_equipe || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'Equipe, Data Início e Data Fim são obrigatórios.' });
    }

    const alocacao = await AlocacaoModel.addEquipe(id_projeto, id_equipe, data_inicio, data_fim, id_empresa);
    res.status(201).json(alocacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Erro ao alocar equipe.' });
  }
};

exports.getEquipes = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const id_empresa = req.empresaId;
    const equipes = await AlocacaoModel.getEquipesByProjeto(id_projeto, id_empresa);
    res.json(equipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar equipes da obra.' });
  }
};

exports.removeMaoObra = async (req, res) => {
  try {
    // Atenção: a rota deve passar id_mao_obra
    const { id_projeto, id_mao_obra } = req.params; 
    const id_empresa = req.empresaId;

    await AlocacaoModel.removeMaoObra(id_mao_obra, id_empresa);
    res.json({ message: 'Equipe desvinculada da obra.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao remover equipe.' });
  }
};
