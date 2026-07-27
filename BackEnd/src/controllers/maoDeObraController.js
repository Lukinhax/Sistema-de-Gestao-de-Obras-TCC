const MaoDeObraModel = require('../models/maoDeObraModel');
const ProjetoModel = require('../models/projetoModel');

exports.allocateEquipe = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const { id_equipe, data_inicio, data_fim } = req.body;
    const id_empresa = req.empresaId;

    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    if (!id_equipe || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'Equipe, data de início e fim são obrigatórios.' });
    }

    const id_mao_obra = await MaoDeObraModel.allocateEquipe({
      data_inicio,
      data_fim,
      id_equipe,
      id_projeto,
      id_empresa
    });

    res.status(201).json({ message: 'Equipe alocada com sucesso!', id_mao_obra });
  } catch (err) {
    console.error('Erro ao alocar equipe (Mão de Obra):', err);
    res.status(500).json({ message: 'Erro interno no servidor ao alocar equipe.' });
  }
};

exports.getMaoDeObraByProjeto = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const id_empresa = req.empresaId;

    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    const maoDeObra = await MaoDeObraModel.findByProjeto(id_projeto, id_empresa);
    res.json(maoDeObra);
  } catch (err) {
    console.error('Erro ao buscar mão de obra:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar mão de obra.' });
  }
};

exports.removeAllocation = async (req, res) => {
  try {
    const { id_projeto, id_mao_obra } = req.params;
    const id_empresa = req.empresaId;

    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    const removed = await MaoDeObraModel.removeAllocation(id_mao_obra, id_empresa);
    if (!removed) {
      return res.status(404).json({ message: 'Alocação não encontrada.' });
    }

    res.json({ message: 'Alocação removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover alocação:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao remover alocação.' });
  }
};
