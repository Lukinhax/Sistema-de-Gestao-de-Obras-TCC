const pool = require('./src/config/database');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'recurso';").then(res => {
  console.log(res.rows);
  pool.end();
});
