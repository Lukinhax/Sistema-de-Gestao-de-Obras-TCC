const pool = require('./src/config/database');

async function run() {
  try {
    await pool.query('ALTER TABLE projeto ADD COLUMN is_favorito BOOLEAN DEFAULT FALSE;');
    console.log("Coluna is_favorito adicionada com sucesso!");
  } catch (e) {
    console.error("Erro na migração:", e.message);
  } finally {
    pool.end();
  }
}

run();
