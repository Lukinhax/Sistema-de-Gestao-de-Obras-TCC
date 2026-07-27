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
import InventoryIcon from '@mui/icons-material/Inventory';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import logo from '../../assets/logo.svg';
import CurrencyInput from 'react-currency-input-field';
import { useTheme } from '../../contexts/ThemeContext';
import './recursos.css';

export default function Recursos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [empresaNome, setEmpresaNome] = useState('Minha Empresa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isDarkMode, toggleTheme } = useTheme();

  // Recursos State
  const [recursos, setRecursos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal de Exclusão
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  // Form State
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [custoUnitario, setCustoUnitario] = useState('');

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

    fetchRecursos();
  }, [token]);

  const fetchRecursos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/recursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (response.ok) setRecursos(data);
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  const openModal = (recurso = null) => {
    if (recurso) {
      setEditingId(recurso.id_recurso);
      setNome(recurso.nome);
      setTipo(recurso.tipo || '');
      setQuantidade(recurso.quantidade);
      setCustoUnitario(recurso.custo_unitario != null ? String(recurso.custo_unitario) : '');
    } else {
      setEditingId(null);
      setNome('');
      setTipo('');
      setQuantidade('');
      setCustoUnitario('');
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmitRecurso = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = editingId 
        ? `http://localhost:3000/api/recursos/${editingId}` 
        : 'http://localhost:3000/api/recursos';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome,
          tipo,
          quantidade: quantidade ? parseInt(quantidade, 10) : 0,
          custo_unitario: custoUnitario ? parseFloat(custoUnitario) : 0
        })
      });

      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error('Servidor offline ou rota inexistente. Você reiniciou o Backend?');
      }

      if (!response.ok) throw new Error(data.message || 'Erro ao salvar recurso.');

      setIsModalOpen(false);
      fetchRecursos();
    } catch (err) {
      setError(err.message || "Erro inesperado de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecurso = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/recursos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setConfirmModal({ isOpen: false, id: null });
        fetchRecursos();
      } else {
        const data = await response.json();
        alert(data.message || 'Erro ao deletar recurso.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao deletar recurso.');
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
          <div className="sidebar-title">Estoque Rápido</div>
          <div className="sidebar-items">
            {recursos.slice(0, 5).map(r => (
              <div key={r.id_recurso} className="sidebar-item">📦 {r.nome} ({r.quantidade})</div>
            ))}
            {recursos.length === 0 && <div className="sidebar-item" style={{color: '#9ca3af', fontStyle:'italic'}}>Nenhum recurso...</div>}
          </div>
        </aside>

        <main className="dashboard-content">
          <div className="content-header">
            <div>
              <h1 className="page-title">Estoque Global de Recursos</h1>
              <p className="page-subtitle">Gerencie todos os materiais e equipamentos da sua empresa.</p>
            </div>
            <button className="btn-primary" onClick={() => openModal()}>
              <AddIcon /> Novo Recurso
            </button>
          </div>

          {recursos.length === 0 ? (
            <div className="empty-state">
              <InventoryIcon className="empty-icon" />
              <h2>Estoque Vazio</h2>
              <p>Adicione materiais ou equipamentos para usá-los em suas obras futuramente.</p>
              <button className="btn-primary" onClick={() => openModal()}>Cadastrar Primeiro Recurso</button>
            </div>
          ) : (
            <div className="recursos-table-container">
              <table className="recursos-table">
                <thead>
                  <tr>
                    <th>Nome do Recurso</th>
                    <th>Tipo</th>
                    <th>Quantidade Disponível</th>
                    <th>Custo Unitário</th>
                    <th>Custo Total em Estoque</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recursos.map(r => (
                    <tr key={r.id_recurso}>
                      <td className="recurso-nome-cell">
                        <div className="recurso-icon">📦</div>
                        <span className="fw-bold">{r.nome}</span>
                      </td>
                      <td><span className="badge-tipo">{r.tipo || 'Não definido'}</span></td>
                      <td className="text-center fw-bold">{r.quantidade}</td>
                      <td>{formatCurrency(r.custo_unitario)}</td>
                      <td className="highlight-text">{formatCurrency(r.quantidade * r.custo_unitario)}</td>
                      <td>
                        <IconButton size="small" onClick={() => openModal(r)}>
                          <EditIcon fontSize="small" color="primary"/>
                        </IconButton>
                        <IconButton size="small" onClick={() => setConfirmModal({ isOpen: true, id: r.id_recurso })}>
                          <DeleteIcon fontSize="small" color="error"/>
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Editar Recurso' : 'Cadastrar Novo Recurso'}</h2>
              <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleSubmitRecurso} className="modal-form">
              <div className="form-group">
                <label>Nome do Recurso *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Ex: Cimento 50kg, Betoneira" />
              </div>
              <div className="form-group">
                <label>Tipo / Categoria</label>
                <input type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex: Material, Equipamento, EPI" />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Quantidade em Estoque</label>
                  <input type="number" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="Ex: 100" />
                </div>
                <div className="form-group half">
                  <label>Custo Unitário</label>
                  <CurrencyInput
                    id="custoUnitario"
                    name="custoUnitario"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    prefix="R$ "
                    value={custoUnitario === '' ? undefined : custoUnitario}
                    onValueChange={(value) => setCustoUnitario(value || '')}
                  />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Recurso'}</button>
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
                Tem certeza que deseja excluir este recurso permanentemente do seu estoque?
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '0 20px 20px 20px' }}>
              <button type="button" className="btn-cancel" onClick={() => setConfirmModal({ isOpen: false, id: null })}>Cancelar</button>
              <button type="button" className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={() => handleDeleteRecurso(confirmModal.id)}>Excluir Recurso</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
