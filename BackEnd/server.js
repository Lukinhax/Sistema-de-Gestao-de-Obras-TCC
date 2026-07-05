require("dotenv").config();
const app = require("./src/app");
const pool = require("./src/config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {

    await pool.query("SELECT NOW()");
    console.log("Banco conectado com sucesso ✔");

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Erro ao conectar no banco:", error);
  }
}

startServer();