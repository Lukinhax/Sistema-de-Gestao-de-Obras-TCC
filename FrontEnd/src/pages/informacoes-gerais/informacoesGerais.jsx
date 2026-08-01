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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { usePermissions } from '../../hooks/usePermissions';
import '../dashboard/dashboard.css'; // reaproveitar o mesmo css

export default function InformacoesGerais() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();
  const { hasPermission } = usePermissions();

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  
  const [statusUnicos, setStatusUnicos] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    totalProjetos: 0,
    projetosEmAndamento: 0,
    orcamentoTotal: 0,
    custoTotal: 0,
    totalTrabalhadores: 0,
    valorEstoque: 0,
    graficoCustos: [],
    graficoStatus: [],
    graficoEspecialidades: []
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
    fetchProjetosForFilter();
    fetchDashboardStats();
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [filtroStatus, filtroDataInicio, filtroDataFim]);

  const fetchProjetosForFilter = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projetos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const unicos = [...new Set(data.map(p => p.status_projeto).filter(Boolean))];
        setStatusUnicos(unicos);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filtroStatus) queryParams.append('status', filtroStatus);
      if (filtroDataInicio) queryParams.append('dataInicio', filtroDataInicio);
      if (filtroDataFim) queryParams.append('dataFim', filtroDataFim);

      const response = await fetch(`http://localhost:3000/api/dashboard/stats?${queryParams.toString()}`, {
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

  const margemBruta = dashboardStats.orcamentoTotal - dashboardStats.custoTotal;
  const margemBrutaPerc = dashboardStats.orcamentoTotal > 0 ? (margemBruta / dashboardStats.orcamentoTotal) * 100 : 0;

  // Cores dinâmicas para o gráfico baseadas no tema
  const textColor = isDarkMode ? '#f9fafb' : '#374151';
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb';
  const tooltipBg = isDarkMode ? '#1f2937' : '#ffffff';
  const chartBg = isDarkMode ? '#1f2937' : '#ffffff';
  
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
            {hasPermission('financeiro_relatorios') && (
              <Link to="/informacoes-gerais" className={location.pathname === '/informacoes-gerais' ? 'active' : ''}>Resumo</Link>
            )}
            {hasPermission('obras_visualizar') && (
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Projetos</Link>
            )}
            {hasPermission('recursos_visualizar') && (
              <Link to="/recursos" className={location.pathname === '/recursos' ? 'active' : ''}>Recursos</Link>
            )}
            {hasPermission('equipes_gerenciar') && (
              <Link to="/equipe" className={location.pathname === '/equipe' ? 'active' : ''}>Equipe</Link>
            )}
          </nav>
        </div>
        <div className="topbar-right" style={{ gap: '10px' }}>
          {(hasPermission('configuracoes_empresa') || hasPermission('configuracoes_usuarios')) && (
            <IconButton onClick={() => navigate('/configuracoes')} style={{ color: isDarkMode ? '#f9fafb' : '#4b5563' }}>
              <SettingsIcon />
            </IconButton>
          )}
          <div className="profile-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="company-name">{empresaNome}</span>
            <KeyboardArrowDownIcon className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {(hasPermission('configuracoes_empresa') || hasPermission('configuracoes_usuarios')) && (
                  <div className="dropdown-item" onClick={() => navigate('/configuracoes')}>
                    <SettingsIcon fontSize="small" /> Todas as configurações
                  </div>
                )}
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
              <h1 className="page-title">Painel de Controle e Resumo</h1>
              <p className="page-subtitle">Acompanhe métricas financeiras, estoque e mão de obra em tempo real.</p>
            </div>
          </div>

          {!hasPermission('financeiro_relatorios') ? (
            <div className="empty-state">
              <h2>Acesso Negado</h2>
              <p>Você não tem permissão para visualizar o resumo financeiro.</p>
            </div>
          ) : (
            <>
              {/* FILTROS DINÂMICOS */}
              <div className="filters-container" style={{ display: 'flex', gap: '15px', marginBottom: '25px', padding: '15px', background: chartBg, borderRadius: '8px', border: `1px solid ${gridColor}`, flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status da Obra</label>
                  <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${gridColor}`, background: chartBg, color: textColor }}>
                    <option value="">Todas as Obras</option>
                    {statusUnicos.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Data Início (De)</label>
                  <input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${gridColor}`, background: chartBg, color: textColor }} />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px', margin: 0 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Data Início (Até)</label>
                  <input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: `1px solid ${gridColor}`, background: chartBg, color: textColor }} />
                </div>
              </div>

              {/* DASHBOARD STATS */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                  <h3>Orçamento Global</h3>
                  <div className="stat-value text-blue">{formatCurrency(dashboardStats.orcamentoTotal)}</div>
                </div>
                <div className="stat-card">
                  <h3>Custo Realizado</h3>
                  <div className="stat-value text-red">{formatCurrency(dashboardStats.custoTotal)}</div>
                </div>
                <div className="stat-card">
                  <h3>Margem Bruta (Estimada)</h3>
                  <div className={`stat-value ${margemBruta >= 0 ? 'text-green' : 'text-red'}`}>
                    {formatCurrency(margemBruta)}
                    <span style={{ fontSize: '1rem', marginLeft: '8px', color: 'var(--text-secondary)' }}>
                      ({margemBrutaPerc.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="stat-card">
                  <h3>Valor em Estoque</h3>
                  <div className="stat-value" style={{ color: '#8b5cf6' }}>{formatCurrency(dashboardStats.valorEstoque)}</div>
                </div>
                <div className="stat-card">
                  <h3>Total de Obras</h3>
                  <div className="stat-value text-orange">{dashboardStats.totalProjetos}</div>
                </div>
              </div>
              
              {/* GRÁFICOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '30px' }}>
                
                {/* Gráfico 1: Orçamento x Custo */}
                <div className="chart-container" style={{background: chartBg, padding: '20px', borderRadius: '12px', border: `1px solid ${gridColor}`}}>
                  <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: textColor}}>Orçamento x Custo (Top 5)</h3>
                  {dashboardStats.graficoCustos && dashboardStats.graficoCustos.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardStats.graficoCustos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={30}>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                          <XAxis dataKey="nome_projeto" stroke={textColor} />
                          <YAxis stroke={textColor} />
                          <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{backgroundColor: tooltipBg, color: textColor, border: `1px solid ${gridColor}`, borderRadius: '8px'}} />
                          <Legend />
                          <Bar dataKey="orcamento_total" fill="#3b82f6" name="Orçamento" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="custo_realizado" fill="#ef4444" name="Custo" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Dados insuficientes para este gráfico.</p>
                  )}
                </div>

                {/* Gráfico 2: Status das Obras */}
                <div className="chart-container" style={{background: chartBg, padding: '20px', borderRadius: '12px', border: `1px solid ${gridColor}`}}>
                  <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: textColor}}>Distribuição de Obras</h3>
                  {dashboardStats.graficoStatus && dashboardStats.graficoStatus.length > 0 ? (
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={dashboardStats.graficoStatus} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            outerRadius={100} 
                            fill="#8884d8"
                            label={(entry) => `${entry.name} (${entry.value})`}
                          >
                            {dashboardStats.graficoStatus.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: tooltipBg, color: textColor, border: `1px solid ${gridColor}`, borderRadius: '8px'}} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Dados insuficientes para este gráfico.</p>
                  )}
                </div>

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
