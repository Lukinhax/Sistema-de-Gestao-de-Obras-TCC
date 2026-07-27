const express = require('express');
const router = express.Router();
const recursoController = require('../controllers/recursoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', recursoController.createRecurso);
router.get('/', recursoController.getRecursos);
router.get('/:id', recursoController.getRecursoById);
router.put('/:id', recursoController.updateRecurso);
router.delete('/:id', recursoController.deleteRecurso);

module.exports = router;
