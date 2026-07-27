const RecursoModel = require('../models/recursoModel');

exports.createRecurso = async (req, res) => {
  try {
    const { nome, tipo, quantidade, custo_unitario } = req.body;
    const id_empresa = req.empresaId;

    if (!nome) {
      return res.status(400).json({ message: 'O nome do recurso é obrigatório.' });
    }

    const recurso = await RecursoModel.create({
      nome,
      tipo,
      quantidade: quantidade ? parseInt(quantidade) : 0,
      custo_unitario: custo_unitario ? parseFloat(custo_unitario) : 0,
      id_empresa
    });

    res.status(201).json(recurso);
  } catch (err) {
    console.error('Erro ao criar recurso:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao criar recurso.' });
  }
};

exports.getRecursos = async (req, res) => {
  try {
    const id_empresa = req.empresaId;
    const recursos = await RecursoModel.findByEmpresa(id_empresa);
    res.json(recursos);
  } catch (err) {
    console.error('Erro ao buscar recursos:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar recursos.' });
  }
};

exports.getRecursoById = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    
    const recurso = await RecursoModel.findById(id, id_empresa);
    
    if (!recurso) {
      return res.status(404).json({ message: 'Recurso não encontrado.' });
    }
    
    res.json(recurso);
  } catch (err) {
    console.error('Erro ao buscar recurso:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar recurso.' });
  }
};

exports.updateRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    const updateData = req.body;

    const recursoAtualizado = await RecursoModel.update(id, id_empresa, updateData);

    if (!recursoAtualizado) {
      return res.status(404).json({ message: 'Recurso não encontrado para atualização.' });
    }

    res.json(recursoAtualizado);
  } catch (err) {
    console.error('Erro ao atualizar recurso:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao atualizar recurso.' });
  }
};

exports.deleteRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;

    const recursoDeletado = await RecursoModel.delete(id, id_empresa);

    if (!recursoDeletado) {
      return res.status(404).json({ message: 'Recurso não encontrado para exclusão.' });
    }

    res.json({ message: 'Recurso excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar recurso:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao deletar recurso.' });
  }
};
