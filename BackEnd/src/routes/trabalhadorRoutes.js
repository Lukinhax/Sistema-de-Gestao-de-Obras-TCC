const express = require('express');
const router = express.Router();
const trabalhadorController = require('../controllers/trabalhadorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', trabalhadorController.createTrabalhador);
router.get('/', trabalhadorController.getTrabalhadores);
router.put('/:id', trabalhadorController.updateTrabalhador);
router.delete('/:id', trabalhadorController.deleteTrabalhador);

module.exports = router;
