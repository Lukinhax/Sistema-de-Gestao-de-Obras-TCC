import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";
import Cadastro from "../pages/cadastro/cadastro";
import Login from "../pages/login/login";
import Dashboard from "../pages/dashboard/dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}