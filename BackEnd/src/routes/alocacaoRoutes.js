const express = require('express');
const router = express.Router({ mergeParams: true }); // Precisa de mergeParams para ler o :id_projeto se montado sob /projetos/:id_projeto/alocacao
const alocacaoController = require('../controllers/alocacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// --- RECURSOS ---
router.post('/recursos', alocacaoController.addRecurso);
router.get('/recursos', alocacaoController.getRecursos);
router.delete('/recursos/:id_recurso', alocacaoController.removeRecurso);

// --- EQUIPES ---
router.post('/equipes', alocacaoController.addEquipe);
router.get('/equipes', alocacaoController.getEquipes);
router.delete('/equipes/:id_mao_obra', alocacaoController.removeMaoObra);

module.exports = router;
