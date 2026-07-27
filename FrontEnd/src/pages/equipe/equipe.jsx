import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { IMaskInput } from 'react-imask';
import CurrencyInput from 'react-currency-input-field';
import logo from '../../assets/logo.svg';
import { useTheme } from '../../contexts/ThemeContext';
import './equipe.css';

export default function Equipe() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  // Tabs state: 'trabalhadores' ou 'equipes'
  const [activeTab, setActiveTab] = useState('trabalhadores');
  
  // Sidebar accordion states
  const [isTrabalhadoresExpanded, setIsTrabalhadoresExpanded] = useState(false);
  const [isEquipesExpanded, setIsEquipesExpanded] = useState(false);

  // Data states
  const [trabalhadores, setTrabalhadores] = useState([]);
  const [equipes, setEquipes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [isTrabalhadorModalOpen, setIsTrabalhadorModalOpen] = useState(false);
  const [isEquipeModalOpen, setIsEquipeModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [equipeSelecionadaParaMembro, setEquipeSelecionadaParaMembro] = useState(null);

  // Formulário Trabalhador
  const [editingTrabalhadorId, setEditingTrabalhadorId] = useState(null);
  const [nomeTrabalhador, setNomeTrabalhador] = useState('');
  const [telefoneTrabalhador, setTelefoneTrabalhador] = useState('');
  const [custoDiario, setCustoDiario] = useState('');

  // Formulário Equipe
  const [editingEquipeId, setEditingEquipeId] = useState(null);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [descricaoEquipe, setDescricaoEquipe] = useState('');

  // Formulário Add Membro
  const [trabalhadorSelecionado, setTrabalhadorSelecionado] = useState('');

  // Modal de Confirmação (Exclusão)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', primaryId: null, secondaryId: null, message: '' });

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
      } catch (err) {}
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    await fetchTrabalhadores();
    await fetchEquipes();
  };

  const fetchTrabalhadores = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/trabalhadores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrabalhadores(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEquipes = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/equipes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEquipes(data);
      }
    } catch (err) {
      console.error(err);
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

  // --- Handlers para Criar/Editar Trabalhador ---
  const handleSaveTrabalhador = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    const url = editingTrabalhadorId 
      ? `http://localhost:3000/api/trabalhadores/${editingTrabalhadorId}` 
      : 'http://localhost:3000/api/trabalhadores';
    const method = editingTrabalhadorId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nome_trabalhador: nomeTrabalhador,
          telefone_trabalhador: telefoneTrabalhador,
          custo_diario: custoDiario
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar.');
      
      closeTrabalhadorModal();
      fetchTrabalhadores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditTrabalhadorModal = (t) => {
    setEditingTrabalhadorId(t.id_trabalhador);
    setNomeTrabalhador(t.nome_trabalhador || '');
    setTelefoneTrabalhador(t.telefone_trabalhador || '');
    setCustoDiario(t.custo_diario != null ? String(t.custo_diario) : '');
    setIsTrabalhadorModalOpen(true);
  };

  const openCreateTrabalhadorModal = () => {
    setEditingTrabalhadorId(null);
    setNomeTrabalhador('');
    setTelefoneTrabalhador('');
    setCustoDiario('');
    setIsTrabalhadorModalOpen(true);
  };

  const closeTrabalhadorModal = () => {
    setIsTrabalhadorModalOpen(false);
    setEditingTrabalhadorId(null);
    setNomeTrabalhador('');
    setTelefoneTrabalhador('');
    setCustoDiario('');
    setError('');
  };

  const handleSaveEquipe = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    const url = editingEquipeId 
      ? `http://localhost:3000/api/equipes/${editingEquipeId}` 
      : 'http://localhost:3000/api/equipes';
    const method = editingEquipeId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome_equipe: nomeEquipe, descricao: descricaoEquipe })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar equipe.');
      
      closeEquipeModal();
      fetchEquipes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditEquipeModal = (eq) => {
    setEditingEquipeId(eq.id_equipe);
    setNomeEquipe(eq.nome_equipe);
    setDescricaoEquipe(eq.descricao || '');
    setIsEquipeModalOpen(true);
  };

  const openCreateEquipeModal = () => {
    setEditingEquipeId(null);
    setNomeEquipe('');
    setDescricaoEquipe('');
    setIsEquipeModalOpen(true);
  };

  const closeEquipeModal = () => {
    setIsEquipeModalOpen(false);
    setEditingEquipeId(null);
    setNomeEquipe('');
    setDescricaoEquipe('');
    setError('');
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/equipes/${equipeSelecionadaParaMembro}/trabalhadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_trabalhador: trabalhadorSelecionado })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao adicionar membro.');
      setTrabalhadorSelecionado('');
      setIsAddMemberModalOpen(false);
      fetchEquipes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestRemoveMember = (idEquipe, idTrabalhador) => {
    setConfirmModal({
      isOpen: true,
      type: 'membro',
      primaryId: idEquipe,
      secondaryId: idTrabalhador,
      message: 'Deseja realmente remover este membro desta equipe?'
    });
  };

  const handleRemoveMember = async (idEquipe, idTrabalhador) => {
    try {
      await fetch(`http://localhost:3000/api/equipes/${idEquipe}/trabalhadores/${idTrabalhador}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEquipes();
    } catch (err) {
      console.error(err);
    }
  };

  const requestDeleteEquipe = (idEquipe) => {
    setConfirmModal({
      isOpen: true,
      type: 'equipe',
      primaryId: idEquipe,
      secondaryId: null,
      message: 'Deseja realmente excluir esta equipe? Os profissionais não serão excluídos, apenas desvinculados.'
    });
  };

  const handleDeleteEquipe = async (idEquipe) => {
    try {
      const res = await fetch(`http://localhost:3000/api/equipes/${idEquipe}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao deletar equipe.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const requestDeleteTrabalhador = (idTrabalhador) => {
    setConfirmModal({
      isOpen: true,
      type: 'trabalhador',
      primaryId: idTrabalhador,
      secondaryId: null,
      message: 'Atenção: Deseja realmente excluir este profissional? Ele será removido automaticamente de todas as equipes em que estiver. Essa ação não tem volta!'
    });
  };

  const handleDeleteTrabalhador = async (idTrabalhador) => {
    try {
      const res = await fetch(`http://localhost:3000/api/trabalhadores/${idTrabalhador}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Erro ao deletar.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeConfirmAction = () => {
    const { type, primaryId, secondaryId } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    if (type === 'trabalhador') handleDeleteTrabalhador(primaryId);
    if (type === 'equipe') handleDeleteEquipe(primaryId);
    if (type === 'membro') handleRemoveMember(primaryId, secondaryId);
  };

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
        <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-title">Painel Rápido</div>
          <div className="sidebar-items">
            {/* TRABALHADORES ACCORDION */}
            <div 
              className="sidebar-item" 
              onClick={() => setIsTrabalhadoresExpanded(!isTrabalhadoresExpanded)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" style={{marginRight: '8px'}}/> 
                Trabalhadores ({trabalhadores.length})
              </div>
              {isTrabalhadoresExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
            </div>
            
            {isTrabalhadoresExpanded && (
              <div className="sidebar-subitems" style={{ paddingLeft: '24px', paddingBottom: '8px' }}>
                {trabalhadores.length === 0 ? (
                  <div className="sidebar-subitem" style={{color: '#9ca3af', fontStyle:'italic', fontSize: '0.85rem'}}>Nenhum trabalhador...</div>
                ) : (
                  trabalhadores.map(t => (
                    <div key={t.id_trabalhador} className="sidebar-subitem" style={{ fontSize: '0.9rem', margin: '4px 0', color: '#d1d5db' }}>
                      • {t.nome_trabalhador}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EQUIPES ACCORDION */}
            <div 
              className="sidebar-item" 
              onClick={() => setIsEquipesExpanded(!isEquipesExpanded)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <GroupsIcon fontSize="small" style={{marginRight: '8px'}}/> 
                Equipes Formadas ({equipes.length})
              </div>
              {isEquipesExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
            </div>

            {isEquipesExpanded && (
              <div className="sidebar-subitems" style={{ paddingLeft: '24px', paddingBottom: '8px' }}>
                {equipes.length === 0 ? (
                  <div className="sidebar-subitem" style={{color: '#9ca3af', fontStyle:'italic', fontSize: '0.85rem'}}>Nenhuma equipe...</div>
                ) : (
                  equipes.map(eq => (
                    <div key={eq.id_equipe} className="sidebar-subitem" style={{ fontSize: '0.9rem', margin: '4px 0', color: '#d1d5db' }}>
                      • {eq.nome_equipe}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="content-header">
            <div>
              <h1 className="page-title">Gestão de Mão de Obra</h1>
              <p className="page-subtitle">Cadastre seus profissionais e organize-os em equipes.</p>
            </div>
            {activeTab === 'trabalhadores' ? (
              <button className="btn-primary" onClick={openCreateTrabalhadorModal}>
                <AddIcon /> Novo Trabalhador
              </button>
            ) : (
              <button className="btn-primary" onClick={openCreateEquipeModal}>
                <AddIcon /> Nova Equipe
              </button>
            )}
          </div>

          <div className="tabs-container">
            <button className={`tab-button ${activeTab === 'trabalhadores' ? 'active' : ''}`} onClick={() => setActiveTab('trabalhadores')}>
              Trabalhadores (Individuais)
            </button>
            <button className={`tab-button ${activeTab === 'equipes' ? 'active' : ''}`} onClick={() => setActiveTab('equipes')}>
              Equipes de Trabalho
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'trabalhadores' && (
              <div className="trabalhadores-section">
                {trabalhadores.length === 0 ? (
                  <div className="empty-state">
                    <PersonIcon className="empty-icon" />
                    <h2>Nenhum trabalhador cadastrado</h2>
                    <p>Comece adicionando seus profissionais.</p>
                    <button className="btn-primary" onClick={openCreateTrabalhadorModal}>Cadastrar Profissional</button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Nome do Profissional</th>
                          <th>Telefone</th>
                          <th>Custo Diário</th>
                          <th style={{width: '100px', textAlign: 'center'}}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trabalhadores.map(t => (
                          <tr key={t.id_trabalhador}>
                            <td className="fw-bold">{t.nome_trabalhador}</td>
                            <td>{t.telefone_trabalhador || '-'}</td>
                            <td className="highlight-text">{formatCurrency(t.custo_diario)}</td>
                            <td style={{textAlign: 'center'}}>
                              <IconButton size="small" color="primary" onClick={() => openEditTrabalhadorModal(t)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => requestDeleteTrabalhador(t.id_trabalhador)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'equipes' && (
              <div className="equipes-section">
                {equipes.length === 0 ? (
                  <div className="empty-state">
                    <GroupsIcon className="empty-icon" />
                    <h2>Nenhuma equipe formada</h2>
                    <p>Crie uma equipe para agrupar seus profissionais.</p>
                    <button className="btn-primary" onClick={openCreateEquipeModal}>Criar Nova Equipe</button>
                  </div>
                ) : (
                  <div className="equipes-grid">
                    {equipes.map(eq => (
                      <div className="equipe-card" key={eq.id_equipe}>
                        <div className="equipe-card-header">
                          <div>
                            <h3 style={{margin: 0}}>{eq.nome_equipe}</h3>
                            <span className="equipe-cost">{formatCurrency(eq.custo_diario_total)} / dia</span>
                          </div>
                          <div style={{display: 'flex', gap: '4px'}}>
                            <IconButton size="small" color="primary" onClick={() => openEditEquipeModal(eq)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => requestDeleteEquipe(eq.id_equipe)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                        <p className="equipe-desc">{eq.descricao || 'Sem descrição'}</p>
                        
                        <div className="equipe-members">
                          <h4>Membros ({eq.trabalhadores.length})</h4>
                          {eq.trabalhadores.length === 0 ? (
                            <p className="text-muted">Nenhum membro nesta equipe.</p>
                          ) : (
                            <div className="members-badge-list">
                              {eq.trabalhadores.map(membro => (
                                <div className="member-badge-item" key={membro.id_trabalhador}>
                                  <div className="member-badge-info">
                                    <PersonIcon fontSize="small" style={{color: '#9ca3af', marginRight: '6px'}}/>
                                    <span>
                                      <strong>{membro.nome_trabalhador}</strong>
                                      <br/>
                                      <small style={{color: '#6b7280'}}>{formatCurrency(membro.custo_diario)}/dia</small>
                                    </span>
                                  </div>
                                  <IconButton size="small" color="error" onClick={() => requestRemoveMember(eq.id_equipe, membro.id_trabalhador)}>
                                    <CloseIcon fontSize="small" />
                                  </IconButton>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="btn-secondary w-100" onClick={() => {
                          setEquipeSelecionadaParaMembro(eq.id_equipe);
                          setIsAddMemberModalOpen(true);
                        }}>
                          <PersonAddIcon fontSize="small" style={{marginRight: '8px'}} /> Adicionar Membro
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL TRABALHADOR */}
      {isTrabalhadorModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTrabalhadorId ? 'Editar Profissional' : 'Cadastrar Profissional'}</h2>
              <IconButton onClick={closeTrabalhadorModal}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleSaveTrabalhador} className="modal-form">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input type="text" value={nomeTrabalhador} onChange={(e) => setNomeTrabalhador(e.target.value)} required placeholder="Ex: João Silva (Pedreiro)" />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Telefone</label>
                  <IMaskInput 
                    mask="(00) 00000-0000"
                    value={telefoneTrabalhador} 
                    onAccept={(value) => setTelefoneTrabalhador(value)} 
                    placeholder="(00) 00000-0000" 
                  />
                </div>
                <div className="form-group half">
                  <label>Custo por Dia</label>
                  <CurrencyInput
                    id="custoDiario"
                    name="custoDiario"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    prefix="R$ "
                    value={custoDiario === '' ? undefined : custoDiario}
                    onValueChange={(value) => setCustoDiario(value || '')}
                  />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeTrabalhadorModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EQUIPE */}
      {isEquipeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingEquipeId ? 'Editar Equipe' : 'Criar Nova Equipe'}</h2>
              <IconButton onClick={closeEquipeModal}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleSaveEquipe} className="modal-form">
              <div className="form-group">
                <label>Nome da Equipe *</label>
                <input type="text" value={nomeEquipe} onChange={(e) => setNomeEquipe(e.target.value)} required placeholder="Ex: Equipe de Fundação" />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea value={descricaoEquipe} onChange={(e) => setDescricaoEquipe(e.target.value)} placeholder="Breve descrição da função desta equipe..." rows="3"></textarea>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeEquipeModal}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR MEMBRO */}
      {isAddMemberModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <div className="modal-header">
              <h2>Adicionar Membro</h2>
              <IconButton onClick={() => setIsAddMemberModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleAddMember} className="modal-form">
              <div className="form-group">
                <label>Selecione o Profissional *</label>
                <select value={trabalhadorSelecionado} onChange={(e) => setTrabalhadorSelecionado(e.target.value)} required>
                  <option value="" disabled>Escolha um trabalhador</option>
                  {trabalhadores.map(t => (
                    <option key={t.id_trabalhador} value={t.id_trabalhador}>{t.nome_trabalhador} (R$ {t.custo_diario}/dia)</option>
                  ))}
                </select>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddMemberModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO (DELETE) */}
      {confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <div className="modal-header">
              <h2>Confirmar Ação</h2>
              <IconButton onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}><CloseIcon /></IconButton>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', color: isDarkMode ? '#d1d5db' : '#374151' }}>
              <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>
                {confirmModal.message}
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '0 20px 20px 20px' }}>
              <button type="button" className="btn-cancel" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={executeConfirmAction}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
