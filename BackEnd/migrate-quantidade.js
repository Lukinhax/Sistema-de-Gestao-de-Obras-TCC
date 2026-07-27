const pool = require('./src/config/database');

async function migrate() {
  try {
    await pool.query('ALTER TABLE recurso ALTER COLUMN quantidade TYPE NUMERIC(12,2);');
    console.log("Migration sucesso: quantidade alterada para NUMERIC(12,2)");
  } catch (err) {
    console.error("Migration erro:", err);
  } finally {
    pool.end();
  }
}

migrate();
