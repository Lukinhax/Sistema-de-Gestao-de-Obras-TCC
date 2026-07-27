const express = require('express');
const router = express.Router();
const equipeController = require('../controllers/equipeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', equipeController.createEquipe);
router.get('/', equipeController.getEquipes);
router.put('/:id', equipeController.updateEquipe);
router.delete('/:id', equipeController.deleteEquipe);

// Rotas Pivô (Vincular Trabalhadores a Equipes)
router.post('/:id/trabalhadores', equipeController.adicionarMembro);
router.delete('/:id/trabalhadores/:id_trabalhador', equipeController.removerMembro);

module.exports = router;
