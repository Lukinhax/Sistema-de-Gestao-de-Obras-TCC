const CustoModel = require('../models/custoModel');
const ProjetoModel = require('../models/projetoModel');

exports.createCusto = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const { descricao, valor, data_registro } = req.body;
    const id_empresa = req.empresaId;

    // Verificar se o projeto pertence à empresa
    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    if (!descricao || valor === undefined) {
      return res.status(400).json({ message: 'Descrição e valor são obrigatórios.' });
    }

    const custo = await CustoModel.create({
      descricao,
      valor,
      data_registro,
      id_projeto
    });

    res.status(201).json(custo);
  } catch (err) {
    console.error('Erro ao criar custo:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao registrar custo.' });
  }
};

exports.getCustosByProjeto = async (req, res) => {
  try {
    const { id_projeto } = req.params;
    const id_empresa = req.empresaId;

    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    const custos = await CustoModel.findByProjeto(id_projeto);
    
    // Obter também o somatório
    const sumResult = await CustoModel.sumByProjeto(id_projeto);
    const total_gasto = sumResult.total_gasto;

    res.json({
      custos,
      orcamento_total: projeto.orcamento_total,
      total_gasto: total_gasto
    });
  } catch (err) {
    console.error('Erro ao buscar custos:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar custos.' });
  }
};

exports.deleteCusto = async (req, res) => {
  try {
    const { id_projeto, id_custo } = req.params;
    const id_empresa = req.empresaId;

    const projeto = await ProjetoModel.findById(id_projeto, id_empresa);
    if (!projeto) {
      return res.status(404).json({ message: 'Projeto não encontrado ou acesso negado.' });
    }

    const custoDeletado = await CustoModel.delete(id_custo);

    if (!custoDeletado) {
      return res.status(404).json({ message: 'Custo não encontrado.' });
    }

    res.json({ message: 'Custo deletado com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar custo:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao deletar custo.' });
  }
};
