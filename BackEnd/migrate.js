const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  try {
    await client.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS cargo (
          id_cargo SERIAL PRIMARY KEY,
          nome_cargo VARCHAR(300) NOT NULL,
          nivel_hierarquico INT,
          id_empresa INT NOT NULL,
          FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    try { await client.query(`ALTER TABLE trabalhador ADD COLUMN tipo_vinculo VARCHAR(50);`); } catch(e){}
    try { await client.query(`ALTER TABLE trabalhador ADD COLUMN id_cargo INT;`); } catch(e){}
    try { await client.query(`ALTER TABLE trabalhador ADD CONSTRAINT fk_cargo FOREIGN KEY (id_cargo) REFERENCES cargo(id_cargo) ON DELETE SET NULL ON UPDATE CASCADE;`); } catch(e){}

    await client.query(`
      CREATE TABLE IF NOT EXISTS projeto_etapa (
          id_etapa SERIAL PRIMARY KEY,
          id_projeto INT NOT NULL,
          codigo_edt VARCHAR(50) NOT NULL,
          nome_tarefa VARCHAR(300) NOT NULL,
          peso_financeiro NUMERIC(5,4),
          status_farol VARCHAR(50) DEFAULT 'NÃO INICIADA',
          duracao_dias INT,
          data_inicio_planejada DATE,
          data_fim_planejada DATE,
          data_inicio_real DATE,
          data_fim_real DATE,
          execucao_real_perc NUMERIC(5,2) DEFAULT 0.00,
          FOREIGN KEY (id_projeto) REFERENCES projeto(id_projeto) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS etapa_dependencia (
          id_dependencia SERIAL PRIMARY KEY,
          id_etapa_sucessora INT NOT NULL,
          id_etapa_predecessora INT NOT NULL,
          tipo_dependencia VARCHAR(50),
          FOREIGN KEY (id_etapa_sucessora) REFERENCES projeto_etapa(id_etapa) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (id_etapa_predecessora) REFERENCES projeto_etapa(id_etapa) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS etapa_alocacao_trabalhador (
          id_alocacao SERIAL PRIMARY KEY,
          id_etapa INT NOT NULL,
          id_trabalhador INT NOT NULL,
          dias_alocados NUMERIC(6,2),
          data_inicio_alocacao DATE,
          data_fim_alocacao DATE,
          FOREIGN KEY (id_etapa) REFERENCES projeto_etapa(id_etapa) ON DELETE CASCADE ON UPDATE CASCADE,
          FOREIGN KEY (id_trabalhador) REFERENCES trabalhador(id_trabalhador) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await client.end();
  }
}

migrate();
