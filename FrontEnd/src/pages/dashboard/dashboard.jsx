import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import logo from '../../assets/logo.svg';
import CurrencyInput from 'react-currency-input-field';
import { useTheme } from '../../contexts/ThemeContext';
import './dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  // Projetos State
  const [projetos, setProjetos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [idProjetoEditando, setIdProjetoEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricaoProjeto, setDescricaoProjeto] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [orcamentoTotal, setOrcamentoTotal] = useState('');
  const [statusProjeto, setStatusProjeto] = useState('Em Planejamento');

  // Confirm Delete Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

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
        if (empresa.nome_empresa) {
          setEmpresaNome(empresa.nome_empresa);
        }
      } catch (err) {
        console.error("Erro ao ler dados da empresa", err);
      }
    }

    fetchProjetos();
  }, [token]);

  const fetchProjetos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projetos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (response.ok) {
          setProjetos(data);
        } else {
          console.error("Erro ao buscar projetos:", data.message);
        }
      } else {
        console.error("O servidor não retornou JSON. Verifique se o backend foi reiniciado.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const openEditModal = (projeto) => {
    setEditMode(true);
    setIdProjetoEditando(projeto.id_projeto);
    setNomeProjeto(projeto.nome_projeto || '');
    setDescricaoProjeto(projeto.descricao_projeto || '');
    setDataInicio(projeto.data_inicio ? projeto.data_inicio.split('T')[0] : '');
    setDataFim(projeto.data_fim ? projeto.data_fim.split('T')[0] : '');
    setOrcamentoTotal(projeto.orcamento_total ? projeto.orcamento_total.toString() : '');
    setStatusProjeto(projeto.status_projeto || 'Em Planejamento');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditMode(false);
    setIdProjetoEditando(null);
    setNomeProjeto('');
    setDescricaoProjeto('');
    setDataInicio('');
    setDataFim('');
    setOrcamentoTotal('');
    setStatusProjeto('Em Planejamento');
    setError('');
  };

  const handleSaveProjeto = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = editMode 
        ? `http://localhost:3000/api/projetos/${idProjetoEditando}` 
        : 'http://localhost:3000/api/projetos';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome_projeto: nomeProjeto,
          descricao_projeto: descricaoProjeto,
          data_inicio: dataInicio || null,
          data_fim: dataFim || null,
          status_projeto: statusProjeto,
          orcamento_total: orcamentoTotal ? parseFloat(orcamentoTotal.toString().replace(',','.')) : 0
        })
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error('Servidor offline ou rota inexistente.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar obra.');
      }

      closeModal();
      fetchProjetos();
    } catch (err) {
      setError(err.message || "Erro inesperado de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProjeto = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projetos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setConfirmModal({ isOpen: false, id: null });
        fetchProjetos();
      } else {
        const data = await response.json();
        alert(data.message || 'Erro ao deletar obra.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('empresa');
    navigate('/login');
  };

  // Formatar moeda BRL
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  // Formatar Data
  const formatDate = (dateString) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="dashboard-layout">
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
          
          <div className="topbar-divider"></div>

          <nav className="topbar-nav">
            <Link to="/informacoes-gerais" className={location.pathname === '/informacoes-gerais' ? 'active' : ''}>Resumo</Link>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Projetos</Link>
            <Link to="/recursos" className={location.pathname === '/recursos' ? 'active' : ''}>Recursos</Link>
            <Link to="/equipe" className={location.pathname === '/equipe' ? 'active' : ''}>Equipe</Link>
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
                  toggleTheme();
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
        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-title">Todas as Obras</div>
          <div className="sidebar-items">
            {projetos.map(proj => (
              <div 
                key={proj.id_projeto} 
                className="sidebar-item cursor-pointer hover-effect"
                onClick={() => navigate(`/projeto/${proj.id_projeto}`)}
                style={{ cursor: 'pointer' }}
              >
                🏗️ {proj.nome_projeto}
              </div>
            ))}
            {projetos.length === 0 && <div className="sidebar-item" style={{color: '#9ca3af', fontStyle:'italic'}}>Nenhuma obra...</div>}
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="dashboard-content">
          <div className="content-header">
            <div>
              <h1 className="page-title">Minhas Obras</h1>
              <p className="page-subtitle">Gerencie todos os seus projetos de construção em andamento.</p>
            </div>
            <button className="btn-primary" onClick={() => { setEditMode(false); setIsModalOpen(true); }}>
              <AddIcon />
              Nova Obra
            </button>
          </div>

          {/* LISTA DE PROJETOS */}
          {projetos.length === 0 ? (
            <div className="empty-state">
              <BusinessCenterIcon className="empty-icon" />
              <h2>Nenhuma obra cadastrada</h2>
              <p>Comece adicionando a sua primeira obra para planejar custos, recursos e equipes.</p>
              <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Criar Primeira Obra</button>
            </div>
          ) : (
            <div className="projetos-grid">
              {projetos.map(projeto => (
                <div key={projeto.id_projeto} className="projeto-card cursor-pointer" onClick={() => navigate(`/projeto/${projeto.id_projeto}`)}>
                  
                  <div className="projeto-card-header">
                    <div>
                      <h3 className="projeto-nome">{projeto.nome_projeto}</h3>
                      <span className={`status-badge ${projeto.status_projeto.toLowerCase().replace(/\s+/g, '-')}`}>
                        {projeto.status_projeto}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditModal(projeto); }}>
                        <EditIcon fontSize="small" style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}/>
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: projeto.id_projeto }); }}>
                        <DeleteIcon fontSize="small" style={{ color: '#ef4444' }}/>
                      </IconButton>
                    </div>
                  </div>
                  <p className="projeto-desc">{projeto.descricao_projeto || 'Sem descrição.'}</p>
                  
                  <div className="projeto-details">
                    <div className="detail-item">
                      <span className="detail-label">Orçamento Total</span>
                      <span className="detail-value highlight">{formatCurrency(projeto.orcamento_total)}</span>
                    </div>
                    <div className="detail-dates">
                      <div className="detail-item">
                        <span className="detail-label">Início</span>
                        <span className="detail-value">{formatDate(projeto.data_inicio)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fim (Previsto)</span>
                        <span className="detail-value">{formatDate(projeto.data_fim)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="projeto-card-footer">
                    <button 
                      className="btn-secondary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projeto/${projeto.id_projeto}`);
                      }}
                    >
                      Acessar Obra
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE NOVA OBRA / EDITAR OBRA */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editMode ? 'Editar Obra' : 'Cadastrar Nova Obra'}</h2>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            
            <form onSubmit={handleSaveProjeto} className="modal-form">
              <div className="form-group">
                <label>Nome do Projeto / Obra *</label>
                <input 
                  type="text" 
                  value={nomeProjeto} 
                  onChange={(e) => setNomeProjeto(e.target.value)} 
                  required 
                  placeholder="Ex: Condomínio Jardim Botânico"
                />
              </div>
              
              <div className="form-group">
                <label>Descrição (Opcional)</label>
                <textarea 
                  value={descricaoProjeto} 
                  onChange={(e) => setDescricaoProjeto(e.target.value)} 
                  rows="3"
                  placeholder="Detalhes adicionais sobre a obra..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Data de Início</label>
                  <input 
                    type="date" 
                    value={dataInicio} 
                    onChange={(e) => setDataInicio(e.target.value)} 
                  />
                </div>
                <div className="form-group half">
                  <label>Data de Fim Previsto</label>
                  <input 
                    type="date" 
                    value={dataFim} 
                    onChange={(e) => setDataFim(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Orçamento Total</label>
                <CurrencyInput
                  id="orcamentoTotal"
                  name="orcamentoTotal"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  value={orcamentoTotal}
                  onValueChange={(value) => setOrcamentoTotal(value)}
                />
              </div>

              {editMode && (
                <div className="form-group">
                  <label>Status da Obra</label>
                  <select value={statusProjeto} onChange={(e) => setStatusProjeto(e.target.value)}>
                    <option value="Em Planejamento">Em Planejamento</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Paralisada">Paralisada</option>
                  </select>
                </div>
              )}

              {error && <p className="error-message">{error}</p>}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : (editMode ? 'Atualizar Obra' : 'Salvar Obra')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <div className="modal-header">
              <h2>Confirmar Exclusão</h2>
              <IconButton onClick={() => setConfirmModal({ isOpen: false, id: null })}><CloseIcon /></IconButton>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', color: isDarkMode ? '#d1d5db' : '#374151' }}>
              <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>
                Atenção: Deseja realmente excluir esta obra? <strong>Todos os dados financeiros e alocações serão perdidos.</strong> Os materiais retornarão ao estoque. Essa ação não tem volta!
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '0 20px 20px 20px' }}>
              <button type="button" className="btn-cancel" onClick={() => setConfirmModal({ isOpen: false, id: null })}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={() => handleDeleteProjeto(confirmModal.id)}>Excluir Obra</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
