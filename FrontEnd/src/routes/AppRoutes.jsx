import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";
import Cadastro from "../pages/cadastro/cadastro";
import Login from "../pages/login/login";
import Dashboard from "../pages/dashboard/dashboard";
import Configuracoes from "../pages/configuracoes/configuracoes";
import Recursos from "../pages/recursos/recursos";
import Equipe from "../pages/equipe/equipe";
import ProjetoDetalhes from "../pages/projeto-detalhes/ProjetoDetalhes";

import InformacoesGerais from "../pages/informacoes-gerais/informacoesGerais";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/informacoes-gerais" element={<InformacoesGerais />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projeto/:id" element={<ProjetoDetalhes />} />
      <Route path="/recursos" element={<Recursos />} />
      <Route path="/equipe" element={<Equipe />} />
      <Route path="/configuracoes" element={<Configuracoes />} />
    </Routes>
  );
}