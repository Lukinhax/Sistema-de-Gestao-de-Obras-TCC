const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

// Rota de Cadastro
router.post("/register", AuthController.register);

// Rota de Login
router.post("/login", AuthController.login);

module.exports = router;
