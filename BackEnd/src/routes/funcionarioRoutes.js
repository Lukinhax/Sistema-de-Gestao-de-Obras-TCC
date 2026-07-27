const express = require("express");
const router = express.Router();
const FuncionarioController = require("../controllers/funcionarioController");
const authMiddleware = require("../middlewares/authMiddleware");

// Todas as rotas de funcionários são protegidas
router.use(authMiddleware);

// Rota para listar funcionários
router.get("/", FuncionarioController.getFuncionarios);

// Rota para criar um funcionário
router.post("/", FuncionarioController.createFuncionario);

// Rota para atualizar funcionário
router.put("/:id", FuncionarioController.updateFuncionario);

// Rota para deletar funcionário
router.delete("/:id", FuncionarioController.deleteFuncionario);

module.exports = router;
