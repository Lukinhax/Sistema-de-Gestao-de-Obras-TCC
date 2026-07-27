const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to get :id_projeto from parent router
const authMiddleware = require('../middlewares/authMiddleware');
const cronogramaController = require('../controllers/cronogramaController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/projetos/:id_projeto/cronograma/etapas
router.get('/etapas', cronogramaController.getEtapas);

// POST /api/projetos/:id_projeto/cronograma/etapas
router.post('/etapas', cronogramaController.criarEtapa);

// PUT /api/projetos/:id_projeto/cronograma/etapas/:id_etapa/progresso
router.put('/etapas/:id_etapa/progresso', cronogramaController.atualizarProgresso);

// GET /api/projetos/:id_projeto/cronograma/curvas
router.get('/curvas', cronogramaController.getCurvaS);

module.exports = router;
