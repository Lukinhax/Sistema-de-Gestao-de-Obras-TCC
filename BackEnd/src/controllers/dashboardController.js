const DashboardModel = require('../models/dashboardModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const id_empresa = req.empresaId;
    const stats = await DashboardModel.getStats(id_empresa, req.query);
    res.json(stats);
  } catch (err) {
    console.error('Erro ao buscar estatísticas do dashboard:', err);
    res.status(500).json({ message: 'Erro interno no servidor ao buscar dados do dashboard.' });
  }
};
