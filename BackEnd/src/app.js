const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const recursoRoutes = require('./routes/recursoRoutes');
const equipeRoutes = require('./routes/equipeRoutes');
const trabalhadorRoutes = require('./routes/trabalhadorRoutes');
const alocacaoRoutes = require('./routes/alocacaoRoutes');
const custoRoutes = require('./routes/custoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cronogramaRoutes = require('./routes/cronogramaRoutes');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/projetos", projetoRoutes);
app.use("/api/recursos", recursoRoutes);
app.use("/api/equipes", equipeRoutes);
app.use("/api/trabalhadores", trabalhadorRoutes);
app.use("/api/projetos/:id_projeto/alocacao", alocacaoRoutes);
app.use("/api/projetos/:id_projeto/custos", custoRoutes);
app.use("/api/projetos/:id_projeto/cronograma", cronogramaRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("TCC RODANDO🚀");
});

module.exports = app;