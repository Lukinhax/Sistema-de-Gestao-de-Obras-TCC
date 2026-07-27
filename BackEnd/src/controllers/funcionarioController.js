const bcrypt = require("bcryptjs");
const FuncionarioModel = require("../models/funcionarioModel");

class FuncionarioController {
  // Cria um novo funcionário
  static async createFuncionario(req, res) {
    try {
      const { nome_usuario, email, senha, permissoes } = req.body;
      const id_empresa = req.empresaId; // Vem do authMiddleware

      if (!nome_usuario || !email || !senha || !permissoes) {
        return res.status(400).json({ message: "Preencha todos os campos obrigatórios." });
      }

      // Verifica se já existe um funcionário (ou empresa) com esse email
      const emailExists = await FuncionarioModel.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({ message: "Login já está em uso." });
      }

      // Hash da senha
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      // Criar funcionário
      const novoFuncionario = await FuncionarioModel.create({
        nome_usuario,
        email,
        senha_hash,
        permissoes,
        id_empresa
      });

      res.status(201).json({
        message: "Funcionário cadastrado com sucesso!",
        funcionario: novoFuncionario
      });
    } catch (error) {
      console.error("Erro ao criar funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  // Lista funcionários da empresa logada
  static async getFuncionarios(req, res) {
    try {
      const id_empresa = req.empresaId; // Vem do authMiddleware

      const funcionarios = await FuncionarioModel.findByEmpresa(id_empresa);
      
      res.status(200).json(funcionarios);
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  static async updateFuncionario(req, res) {
    try {
      const { id } = req.params;
      const id_empresa = req.empresaId;
      const updateData = req.body;

      const funcionarioAtualizado = await FuncionarioModel.update(id, id_empresa, updateData);

      if (!funcionarioAtualizado) {
        return res.status(404).json({ message: "Funcionário não encontrado ou não pertence a esta empresa." });
      }

      res.json({ message: "Funcionário atualizado com sucesso.", funcionario: funcionarioAtualizado });
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  static async deleteFuncionario(req, res) {
    try {
      const { id } = req.params;
      const id_empresa = req.empresaId;

      const funcionarioDeletado = await FuncionarioModel.delete(id, id_empresa);

      if (!funcionarioDeletado) {
        return res.status(404).json({ message: "Funcionário não encontrado ou não pertence a esta empresa." });
      }

      res.json({ message: "Funcionário excluído com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}

module.exports = FuncionarioController;
