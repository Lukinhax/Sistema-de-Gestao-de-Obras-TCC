const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const EmpresaModel = require("../models/empresaModel");

// Carregar variáveis de ambiente
require("dotenv").config();

class AuthController {
  // --- Registro da Empresa ---
  static async register(req, res) {
    try {
      const { nome_empresa, email, n_telefone, cnpj, senha } = req.body;

      // Validações básicas
      if (!nome_empresa || !email || !cnpj || !senha) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
      }

      // Verificar se CNPJ ou Email já existem
      const emailExists = await EmpresaModel.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ message: "Empresa já cadastrada com esse e-mail." });
      }

      const cnpjExists = await EmpresaModel.findByCnpj(cnpj);
      if (cnpjExists) {
        return res.status(400).json({ message: "Empresa já cadastrada com esse CNPJ." });
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      // Salvar no banco via Model
      const novaEmpresa = await EmpresaModel.create({
        nome_empresa,
        email,
        n_telefone,
        cnpj,
        senha_hash,
      });

      res.status(201).json({
        message: "Empresa registrada com sucesso!",
        empresa: novaEmpresa,
      });
    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  // --- Login da Empresa ---
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({ message: "Preencha e-mail e senha." });
      }

      // Buscar empresa pelo email
      const empresa = await EmpresaModel.findByEmail(email);
      if (!empresa) {
        return res.status(404).json({ message: "E-mail ou senha incorretos." });
      }

      // Comparar senhas
      const isMatch = await bcrypt.compare(senha, empresa.senha_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "E-mail ou senha incorretos." });
      }

      // Gerar Token JWT
      const token = jwt.sign(
        { id_empresa: empresa.id_empresa },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Login realizado com sucesso!",
        token,
        empresa: {
          id_empresa: empresa.id_empresa,
          nome_empresa: empresa.nome_empresa,
          email: empresa.email,
        },
      });
    } catch (error) {
      console.error("Erro no login:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}

module.exports = AuthController;
