const TrabalhadorModel = require('../models/trabalhadorModel');

exports.createTrabalhador = async (req, res) => {
  try {
    const { nome_trabalhador, telefone_trabalhador, custo_diario } = req.body;
    const id_empresa = req.empresaId;

    if (!nome_trabalhador) {
      return res.status(400).json({ message: 'O nome do trabalhador é obrigatório.' });
    }

    const trabalhador = await TrabalhadorModel.create({
      nome_trabalhador,
      telefone_trabalhador,
      custo_diario: custo_diario ? parseFloat(custo_diario) : 0,
      id_empresa
    });

    res.status(201).json(trabalhador);
  } catch (err) {
    console.error('Erro ao criar trabalhador:', err);
    res.status(500).json({ message: 'Erro interno ao criar trabalhador.' });
  }
};

exports.getTrabalhadores = async (req, res) => {
  try {
    const id_empresa = req.empresaId;
    const trabalhadores = await TrabalhadorModel.findByEmpresa(id_empresa);
    res.json(trabalhadores);
  } catch (err) {
    console.error('Erro ao buscar trabalhadores:', err);
    res.status(500).json({ message: 'Erro interno ao buscar trabalhadores.' });
  }
};

exports.updateTrabalhador = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    const updateData = req.body;

    const trabalhadorAtualizado = await TrabalhadorModel.update(id, id_empresa, updateData);

    if (!trabalhadorAtualizado) {
      return res.status(404).json({ message: 'Trabalhador não encontrado para atualização.' });
    }

    res.json(trabalhadorAtualizado);
  } catch (err) {
    console.error('Erro ao atualizar trabalhador:', err);
    res.status(500).json({ message: 'Erro interno ao atualizar trabalhador.' });
  }
};

exports.deleteTrabalhador = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;

    const trabalhadorDeletado = await TrabalhadorModel.delete(id, id_empresa);

    if (!trabalhadorDeletado) {
      return res.status(404).json({ message: 'Trabalhador não encontrado para exclusão.' });
    }

    res.json({ message: 'Trabalhador excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar trabalhador:', err);
    res.status(500).json({ message: 'Erro interno ao deletar trabalhador.' });
  }
};
