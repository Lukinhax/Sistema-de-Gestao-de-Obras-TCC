const ProjetoModel = require('../models/projetoModel');

exports.createProjeto = async (req, res) => {
  try {
    const { nome_projeto, descricao_projeto, data_inicio, data_fim, status_projeto, orcamento_total } = req.body;
    
    // O id_empresa vem do token JWT que foi decodificado no middleware (authMiddleware)
    const id_empresa = req.empresaId;

    if (!nome_projeto) {
      return res.status(400).json({ message: 'O nome do projeto é obrigatório.' });
    }

    const projeto = await ProjetoModel.create({
      nome_projeto,
      descricao_projeto,
      data_inicio: data_inicio || null,
      data_fim: data_fim || null,
      status_projeto: status_projeto || 'Em Planejamento',
      orcamento_total: orcamento_total || 0.00,
      id_empresa
    });

    res.status(201).json(projeto);
  } catch (err) {
    console.error('Erro ao criar projeto:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao criar projeto.' });
  }
};

exports.getProjetos = async (req, res) => {
  try {
    const id_empresa = req.empresaId;
    const projetos = await ProjetoModel.findByEmpresa(id_empresa);
    res.json(projetos);
  } catch (err) {
    console.error('Erro ao buscar projetos:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar projetos.' });
  }
};

exports.getProjetoById = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    
    const projeto = await ProjetoModel.findById(id, id_empresa);
    
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou não pertence a esta empresa.' });
    }
    
    res.json(projeto);
  } catch (err) {
    console.error('Erro ao buscar projeto:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar projeto.' });
  }
};

exports.updateProjeto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;
    const updateData = req.body;

    const projetoAtualizado = await ProjetoModel.update(id, id_empresa, updateData);

    if (!projetoAtualizado) {
      return res.status(404).json({ message: 'Projeto não encontrado para atualização.' });
    }

    res.json(projetoAtualizado);
  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao atualizar projeto.' });
  }
};

exports.deleteProjeto = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;

    const projetoDeletado = await ProjetoModel.delete(id, id_empresa);

    if (!projetoDeletado) {
      return res.status(404).json({ message: 'Projeto não encontrado para exclusão.' });
    }

    res.json({ message: 'Projeto excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar projeto:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao deletar projeto.' });
  }
};

exports.toggleFavorito = async (req, res) => {
  try {
    const { id } = req.params;
    const id_empresa = req.empresaId;

    const result = await ProjetoModel.toggleFavorito(id, id_empresa);

    if (!result) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }

    res.json({ message: 'Status de favorito alterado com sucesso.', is_favorito: result.is_favorito });
  } catch (err) {
    console.error('Erro ao alterar favorito:', err);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};
