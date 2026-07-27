import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.svg';
import { useTheme } from '../../contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import '../dashboard/dashboard.css'; // reaproveitar o mesmo css

export default function InformacoesGerais() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  const [dashboardStats, setDashboardStats] = useState({
    totalProjetos: 0,
    projetosEmAndamento: 0,
    orcamentoTotal: 0,
    custoTotal: 0,
    totalTrabalhadores: 0,
    graficoCustos: []
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const empresaData = localStorage.getItem('empresa');
    if (empresaData) {
      try {
        const empresa = JSON.parse(empresaData);
        if (empresa.nome_empresa) setEmpresaNome(empresa.nome_empresa);
      } catch (err) { console.error("Erro ao ler dados da empresa", err); }
    }
    fetchDashboardStats();
  }, [token]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDashboardStats(await response.json());
      }
    } catch (err) {
      console.error("Erro ao buscar stats do dashboard:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
    navigate('/login');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  // Cores dinâmicas para o gráfico baseadas no tema
  const textColor = isDarkMode ? '#f9fafb' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
  const chartBg = isDarkMode ? '#1f2937' : '#ffffff';

  return (
    <div className="dashboard-layout">
      {/* BARRA SUPERIOR (TOPBAR) */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ marginRight: '10px' }}>
            <MenuIcon />
          </IconButton>
          <Link to="/dashboard">
            <img src={logo} alt="Gestão de Obras Logo" className="topbar-logo" />
          </Link>
          <div className="topbar-divider"></div>
          <nav className="topbar-nav">
            <Link to="/informacoes-gerais" className={location.pathname === '/informacoes-gerais' ? 'active' : ''}>Resumo</Link>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Projetos</Link>
            <Link to="/recursos" className={location.pathname === '/recursos' ? 'active' : ''}>Recursos</Link>
            <Link to="/equipe" className={location.pathname === '/equipe' ? 'active' : ''}>Equipe</Link>
          </nav>
        </div>
        <div className="topbar-right" style={{ gap: '10px' }}>
          <IconButton onClick={() => navigate('/configuracoes')} style={{ color: isDarkMode ? '#f9fafb' : '#4b5563' }}>
            <SettingsIcon />
          </IconButton>
          <div className="profile-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="company-name">{empresaNome}</span>
            <KeyboardArrowDownIcon className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate('/configuracoes')}>
                  <SettingsIcon fontSize="small" /> Todas as configurações
                </div>
                <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); toggleTheme(); }}>
                  {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  {isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogoutIcon fontSize="small" /> Sair da conta
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <div className="dashboard-main">
        <main className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div className="content-header">
            <div>
              <h1 className="page-title">Informações Gerais</h1>
              <p className="page-subtitle">Visão geral financeira e de progresso de todos os seus projetos.</p>
            </div>
          </div>

          {/* DASHBOARD STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Orçamento Global (Todas as Obras)</h3>
              <div className="stat-value text-green">{formatCurrency(dashboardStats.orcamentoTotal)}</div>
            </div>
            <div className="stat-card">
              <h3>Custo Realizado Total</h3>
              <div className="stat-value text-red">{formatCurrency(dashboardStats.custoTotal)}</div>
            </div>
            <div className="stat-card">
              <h3>Projetos Ativos</h3>
              <div className="stat-value text-blue">{dashboardStats.projetosEmAndamento} / {dashboardStats.totalProjetos}</div>
            </div>
            <div className="stat-card">
              <h3>Total de Trabalhadores</h3>
              <div className="stat-value text-orange">{dashboardStats.totalTrabalhadores}</div>
            </div>
          </div>
          
          {/* GRÁFICO */}
          {dashboardStats.graficoCustos && dashboardStats.graficoCustos.length > 0 ? (
            <div className="chart-container" style={{background: chartBg, padding: '20px', borderRadius: '12px', marginBottom: '30px', border: `1px solid ${gridColor}`}}>
              <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: textColor}}>Orçamento x Custo (Top 5 Projetos)</h3>
              <div style={{ width: '100%', height: 300, minWidth: 0, overflowX: 'auto' }}>
                <div style={{ minWidth: '500px', height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats.graficoCustos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="nome_projeto" stroke={textColor} />
                      <YAxis stroke={textColor} />
                      <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{backgroundColor: tooltipBg, color: textColor, border: `1px solid ${gridColor}`, borderRadius: '8px'}} />
                      <Bar dataKey="orcamento_total" fill="#3b82f6" name="Orçamento Total" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="custo_realizado" fill="#ef4444" name="Custo Realizado" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{marginTop: '20px'}}>
              <h2>Nenhum dado para o gráfico</h2>
              <p>Cadastre projetos e lance custos para visualizar o painel.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
