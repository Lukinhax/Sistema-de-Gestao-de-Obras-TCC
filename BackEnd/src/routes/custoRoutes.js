const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams para pegar o :id_projeto da rota pai
const custoController = require('../controllers/custoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', custoController.createCusto);
router.get('/', custoController.getCustosByProjeto);
router.delete('/:id_custo', custoController.deleteCusto);

module.exports = router;
