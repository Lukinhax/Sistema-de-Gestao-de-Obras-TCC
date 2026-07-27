const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de projetos exigem que o usuário esteja autenticado
router.use(authMiddleware);

router.post('/', projetoController.createProjeto);
router.get('/', projetoController.getProjetos);
router.get('/:id', projetoController.getProjetoById);
router.put('/:id', projetoController.updateProjeto);
router.put('/:id/favorito', projetoController.toggleFavorito);
router.delete('/:id', projetoController.deleteProjeto);

module.exports = router;
