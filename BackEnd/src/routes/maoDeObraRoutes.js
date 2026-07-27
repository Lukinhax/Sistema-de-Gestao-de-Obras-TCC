const express = require('express');
const router = express.Router({ mergeParams: true });
const maoDeObraController = require('../controllers/maoDeObraController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', maoDeObraController.allocateEquipe);
router.get('/', maoDeObraController.getMaoDeObraByProjeto);
router.delete('/:id_mao_obra', maoDeObraController.removeAllocation);

module.exports = router;
