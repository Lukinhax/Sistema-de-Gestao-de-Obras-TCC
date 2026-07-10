import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import logo from '../../assets/logo.svg';
import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Lê a preferência salva no computador do usuário, se não existir, usa 'claro' por padrão
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Busca o nome da empresa salva no localStorage durante o Login
    const empresaData = localStorage.getItem('empresa');
    if (empresaData) {
      try {
        const empresa = JSON.parse(empresaData);
        if (empresa.nome_empresa) {
          setEmpresaNome(empresa.nome_empresa);
        }
      } catch (err) {
        console.error("Erro ao ler dados da empresa", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
    navigate('/login');
  };

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* BARRA SUPERIOR (TOPBAR) */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <IconButton 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            style={{ marginRight: '10px' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Link to="/dashboard">
            <img src={logo} alt="Gestão de Obras Logo" className="topbar-logo" />
          </Link>
          
          {/* Divisor vertical para separar a logo do menu */}
          <div className="topbar-divider"></div>

          <nav className="topbar-nav">
            <Link to="/dashboard" className="active">Projetos</Link>
            <Link to="#">Recursos</Link>
            <Link to="#">Equipe</Link>
          </nav>
        </div>

        <div className="topbar-right" style={{ gap: '10px' }}>
          <IconButton 
            onClick={() => navigate('/configuracoes')} 
            title="Configurações" 
            style={{ color: isDarkMode ? '#f9fafb' : '#4b5563' }}
          >
            <SettingsIcon />
          </IconButton>

          <div className="profile-container" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <span className="company-name">{empresaNome}</span>
            <KeyboardArrowDownIcon className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => navigate('/configuracoes')}>
                  <SettingsIcon fontSize="small" />
                  Todas as configurações
                </div>
                <div className="dropdown-item" onClick={(e) => { 
                  e.stopPropagation(); 
                  const newTheme = !isDarkMode;
                  setIsDarkMode(newTheme); 
                  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
                }}>
                  {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                  {isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
                </div>
                <div className="dropdown-item logout" onClick={handleLogout}>
                  <LogoutIcon fontSize="small" />
                  Sair da conta
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL */}
      <div className="dashboard-main">
        {/* BARRA LATERAL (SIDEBAR) */}
        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-title">Favoritos</div>
          <div className="sidebar-items">
            <div className="sidebar-item">⭐ Obra Residencial Alpha</div>
            <div className="sidebar-item">⭐ Galpão Logístico Beta</div>
            <div className="sidebar-item">⭐ Custo de Cimento</div>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="dashboard-content">
          <div className="welcome-box">
            <h1>Bem-vindo, {empresaNome}!</h1>
            <p>O Módulo de <b>Projetos (Obras)</b> será implementado aqui na próxima etapa.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
