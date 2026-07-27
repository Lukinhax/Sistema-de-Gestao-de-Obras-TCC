const EquipeModel = require('../models/equipeModel');

exports.createEquipe = async (req, res) => {
  try {
    const { nome_equipe, descricao } = req.body;
    const id_empresa = req.empresaId;

    if (!nome_equipe) {
      return res.status(400).json({ message: 'O nome da equipe é obrigatório.' });
    }

    const equipe = await EquipeModel.create({
      nome_equipe,
      descricao,
      id_empresa
    });

    res.status(201).json(equipe);
  } catch (err) {
    console.error('Erro ao criar equipe:', err);
    res.status(500).json({ message: 'Erro interno ao criar equipe.' });
  }
};

exports.getEquipes = async (req, res) => {
  try {
    const id_empresa = req.empresaId;
    const equipes = await EquipeModel.findByEmpresa(id_empresa);
    res.json(equipes);
  } catch (err) {
    console.error('Erro ao buscar equipes:', err);
    res.status(500).json({ message: 'Erro interno ao buscar equipes.' });
  }
};

exports.updateEquipe = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    const updateData = req.body;

    const equipeAtualizada = await EquipeModel.update(id, id_empresa, updateData);

    if (!equipeAtualizada) {
      return res.status(404).json({ message: 'Equipe não encontrada para atualização.' });
    }

    res.json(equipeAtualizada);
  } catch (err) {
    console.error('Erro ao atualizar equipe:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar equipe.' });
  }
};

exports.deleteEquipe = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;

    const equipeDeletada = await EquipeModel.delete(id, id_empresa);

    if (!equipeDeletada) {
      return res.status(404).json({ message: 'Equipe não encontrada para exclusão.' });
    }

    res.json({ message: 'Equipe excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar equipe:', err);
    res.status(500).json({ message: 'Erro interno ao deletar equipe.' });
  }
};

exports.adicionarMembro = async (req, res) => {
  try {
    const { id } = req.params; // id_equipe
    const { id_trabalhador } = req.body;
    // Opcionalmente podemos validar se o trabalhador e a equipe pertencem à empresa aqui, 
    // mas por simplicidade e devido às foreign keys criadas, a tentativa falharia se não fossem válidos
    // ou simplesmente assumimos que o id_trabalhador passado é válido.

    if (!id_trabalhador) {
      return res.status(400).json({ message: 'id_trabalhador é obrigatório.' });
    }

    await EquipeModel.addTrabalhador(id, id_trabalhador);
    res.status(201).json({ message: 'Trabalhador adicionado à equipe com sucesso.' });
  } catch (err) {
    console.error('Erro ao adicionar membro à equipe:', err);
    res.status(500).json({ message: 'Erro interno ao adicionar membro.' });
  }
};

exports.removerMembro = async (req, res) => {
  try {
    const { id, id_trabalhador } = req.params;

    await EquipeModel.removeTrabalhador(id, id_trabalhador);
    res.json({ message: 'Trabalhador removido da equipe com sucesso.' });
  } catch (err) {
    console.error('Erro ao remover membro da equipe:', err);
    res.status(500).json({ message: 'Erro interno ao remover membro.' });
  }
};
