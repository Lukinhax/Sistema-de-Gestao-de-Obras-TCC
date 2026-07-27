const pool = require('./src/config/database');

async function migrate() {
  try {
    await pool.query('ALTER TABLE recurso ALTER COLUMN quantidade TYPE INTEGER;');
    console.log("Migration sucesso: quantidade alterada para INTEGER");
  } catch (err) {
    console.error("Migration erro:", err);
  } finally {
    pool.end();
  }
}

migrate();
