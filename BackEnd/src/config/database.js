require("dotenv").config();
const { Pool, types } = require("pg");

// O node-postgres converte colunas DATE para objetos Date em UTC (ex: 2025-08-12T00:00:00.000Z).
// No fuso -03:00, ao exibir no frontend isso vira 2025-08-11T21:00, mostrando o dia anterior.
// Solução: sobrescrever o parser do tipo DATE (OID 1082) para retornar a string "YYYY-MM-DD"
// diretamente, sem nenhuma conversão de timezone.
types.setTypeParser(1082, (value) => value); // retorna "YYYY-MM-DD" como string pura

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;