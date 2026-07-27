import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '../../contexts/ThemeContext';
import Relatorios from './Relatorios';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import './configuracoes.css';

export default function Configuracoes() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Form states
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [prefixoLogin, setPrefixoLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('sistema');

  // Edit/Modal mode states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [idFuncionarioEditando, setIdFuncionarioEditando] = useState(null);


  const PERMISSOES_DISPONIVEIS = [
    { categoria: 'Gestão de Obras', permissoes: [
        { id: 'obras_criar', label: 'Criar / Editar Obras' },
        { id: 'obras_excluir', label: 'Excluir Obras' },
        { id: 'obras_visualizar', label: 'Visualizar Obras' },
    ]},
    { categoria: 'Financeiro', permissoes: [
        { id: 'financeiro_custos', label: 'Registrar Custos' },
        { id: 'financeiro_relatorios', label: 'Acessar Resumo / Gráficos' },
    ]},
    { categoria: 'Estoque e Materiais', permissoes: [
        { id: 'recursos_adicionar', label: 'Cadastrar / Editar Materiais' },
        { id: 'recursos_excluir', label: 'Excluir Materiais' },
        { id: 'recursos_visualizar', label: 'Visualizar Estoque' },
    ]},
    { categoria: 'Mão de Obra e Equipes', permissoes: [
        { id: 'equipes_gerenciar', label: 'Cadastrar Trabalhadores' },
        { id: 'alocacoes_vincular', label: 'Montar Equipes / Alocar em Obras' },
    ]},
    { categoria: 'Sistema', permissoes: [
        { id: 'configuracoes_usuarios', label: 'Gerenciar Usuários' },
        { id: 'configuracoes_empresa', label: 'Configurações Globais' },
    ]}
  ];

  const handleTogglePermissao = (id) => {
    setPermissoesSelecionadas(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };
  
  const empresaString = localStorage.getItem('empresa');
  const token = localStorage.getItem('token');
  const empresa = empresaString ? JSON.parse(empresaString) : null;
  
  // Create the domain part of the email automatically
  const dominioEmpresa = empresa && empresa.nome_empresa 
    ? `@${empresa.nome_empresa.replace(/\s+/g, '').toLowerCase()}`
    : '@empresa';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFuncionarios();
  }, [token]);

  const fetchFuncionarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/funcionarios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setFuncionarios(data);
      } else {
        console.error("Erro ao buscar funcionários:", data.message);
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const handleCreateFuncionario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (permissoesSelecionadas.length === 0) {
      setError('Selecione ao menos uma permissão.');
      setLoading(false);
      return;
    }

    const emailCompleto = `${prefixoLogin}${dominioEmpresa}`;

    try {
      const url = editMode 
        ? `http://localhost:3000/api/funcionarios/${idFuncionarioEditando}` 
        : 'http://localhost:3000/api/funcionarios';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome_usuario: nomeUsuario,
          email: emailCompleto,
          senha,
          permissoes: permissoesSelecionadas.join(',')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao salvar funcionário.');
      }

      setSuccess(editMode ? 'Funcionário atualizado!' : 'Funcionário criado com sucesso!');
      
      // Limpar campos
      handleCloseModal();
      fetchFuncionarios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFuncionario = async (id) => {
    if(!window.confirm("Deseja realmente remover este acesso? O funcionário não poderá mais logar.")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const funcionariosAtualizados = funcionarios.filter(f => f.id_funcionario !== id);
        setFuncionarios(funcionariosAtualizados);
        setSuccess('Usuário excluído com sucesso!');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir usuário.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao excluir usuário.');
    }
  };

  const handleEditClick = (func) => {
    setEditMode(true);
    setIdFuncionarioEditando(func.id_funcionario);
    setNomeUsuario(func.nome_usuario);
    setPermissoesSelecionadas(func.permissoes ? func.permissoes.split(',') : []);
    
    // Extrai apenas a parte antes do @ para o prefixo (se existir)
    if (func.email && func.email.includes('@')) {
      setPrefixoLogin(func.email.split('@')[0]);
    } else {
      setPrefixoLogin(func.email || '');
    }
    
    setSenha('');
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNomeUsuario('');
    setPrefixoLogin('');
    setSenha('');
    setPermissoesSelecionadas([]);
    setEditMode(false);
    setIdFuncionarioEditando(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="configuracoes-container">
      <div className="configuracoes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Configurações</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isDarkMode ? '#e5e7eb' : '#4b5563' }}>
              {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
            </span>
            <div 
              onClick={toggleTheme}
              style={{ 
                cursor: 'pointer', 
                width: '44px', 
                height: '24px', 
                background: isDarkMode ? '#3b82f6' : '#d1d5db',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '2px',
                left: isDarkMode ? '22px' : '2px',
                width: '20px',
                height: '20px',
                background: '#fff',
                borderRadius: '50%',
                transition: 'left 0.3s'
              }} />
            </div>
          </div>

          <button className="btn-voltar" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        paddingBottom: '10px',
        overflowX: 'auto'
      }}>
        <button 
          onClick={() => setActiveTab('sistema')}
          style={{
            background: activeTab === 'sistema' ? '#3b82f6' : 'transparent',
            color: activeTab === 'sistema' ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <SettingsSuggestIcon fontSize="small" />
          Sistema e Usuários
        </button>
        
        <button 
          onClick={() => setActiveTab('relatorios')}
          style={{
            background: activeTab === 'relatorios' ? '#3b82f6' : 'transparent',
            color: activeTab === 'relatorios' ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <InsertChartIcon fontSize="small" />
          Relatórios e Excel
        </button>
      </div>

      <div className="configuracoes-content">
        {activeTab === 'sistema' && (
          <div style={{ display: 'block', width: '100%' }}>

            {/* Seção da Tabela de Funcionários */}
            <section className="card-section list-section" style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, background: isDarkMode ? '#1f2937' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Funcionários Cadastrados</h2>
                  <p style={{ margin: '5px 0 0 0', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>Gerencie os acessos e permissões do sistema.</p>
                </div>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  style={{
                    background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#2563eb'}
                  onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                >
                  + Novo Funcionário
                </button>
              </div>

              {funcionarios.length === 0 ? (
                <p className="empty-list">Nenhum funcionário cadastrado ainda.</p>
              ) : (
                <div className="table-responsive">
                  <table className="funcionarios-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Login</th>
                        <th>Permissões</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funcionarios.map((func) => (
                        <tr key={func.id_funcionario}>
                          <td className="fw-bold">{func.nome_usuario}</td>
                          <td>{func.email}</td>
                          <td>
                            <div className="badges-container">
                              {func.permissoes.split(',').map(p => (
                                <span key={p} className={`badge-permissao ${p.toLowerCase()}`}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <IconButton size="small" onClick={() => handleEditClick(func)}>
                              <EditIcon fontSize="small" color="primary"/>
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteFuncionario(func.id_funcionario)}>
                              <DeleteIcon fontSize="small" color="error"/>
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Modal de Adicionar/Editar Funcionário */}
            {isModalOpen && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
              }}>
                <div style={{
                  background: isDarkMode ? '#1f2937' : '#fff', padding: '30px', borderRadius: '12px',
                  width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative'
                }}>
                  <button 
                    onClick={handleCloseModal}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                  >
                    <CloseIcon />
                  </button>
                  
                  <h2 style={{ marginTop: 0 }}>{editMode ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
                  <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: '20px' }}>
                    {editMode ? 'Altere as informações ou permissões do usuário.' : 'Crie um acesso para um funcionário da sua empresa.'}
                  </p>

                  <form onSubmit={handleCreateFuncionario} className="funcionario-form">
                    
                    <div className="input-group">
                      <label htmlFor="nomeUsuario">Nome Completo</label>
                      <input 
                        type="text" 
                        id="nomeUsuario"
                        value={nomeUsuario} 
                        onChange={(e) => setNomeUsuario(e.target.value)} 
                        required 
                        placeholder="Ex: João da Silva"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
                      />
                    </div>

                    {!editMode && (
                      <>
                        <div className="input-group" style={{ marginTop: '15px' }}>
                          <label htmlFor="prefixoLogin">Login do Funcionário</label>
                          <div className="login-input-wrapper" style={{ display: 'flex' }}>
                            <input 
                              type="text" 
                              id="prefixoLogin"
                              value={prefixoLogin} 
                              onChange={(e) => setPrefixoLogin(e.target.value.replace(/\s+/g, ''))} 
                              required 
                              placeholder="Ex: joao"
                              style={{ flex: 1, padding: '10px', borderRadius: '6px 0 0 6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
                            />
                            <span className="dominio-label" style={{ padding: '10px 15px', background: isDarkMode ? '#4b5563' : '#f3f4f6', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, borderLeft: 'none', borderRadius: '0 6px 6px 0', color: isDarkMode ? '#d1d5db' : '#6b7280' }}>{dominioEmpresa}</span>
                          </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '15px' }}>
                          <label htmlFor="senha">Senha de Acesso</label>
                          <div className="password-input-wrapper" style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? "text" : "password"} 
                              id="senha"
                              value={senha} 
                              onChange={(e) => setSenha(e.target.value)} 
                              required={!editMode}
                              placeholder="Digite uma senha segura"
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
                            />
                            <IconButton 
                              size="small"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="input-group" style={{ marginTop: '20px' }}>
                      <label>Permissões Específicas de Acesso</label>
                      <div className="permissions-categories" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                        {PERMISSOES_DISPONIVEIS.map(cat => (
                          <div key={cat.categoria} className="permission-category" style={{ padding: '10px', background: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: isDarkMode ? '#d1d5db' : '#4b5563', borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`, paddingBottom: '5px' }}>{cat.categoria}</h4>
                            <div className="permissions-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                              {cat.permissoes.map(perm => (
                                <label key={perm.id} className="permission-checkbox" style={{ color: isDarkMode ? '#f9fafb' : '#374151' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={permissoesSelecionadas.includes(perm.id)}
                                    onChange={() => handleTogglePermissao(perm.id)}
                                  />
                                  <span className="checkmark"></span>
                                  {perm.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {error && <p className="error-message" style={{ color: '#ef4444', marginTop: '10px' }}>{error}</p>}
                    {success && <p className="success-message" style={{ color: '#10b981', marginTop: '10px' }}>{success}</p>}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                      <button type="submit" disabled={loading} style={{
                        background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1
                      }}>
                        {loading ? 'Salvando...' : (editMode ? 'Salvar Alterações' : 'Cadastrar Acesso')}
                      </button>
                      <button type="button" onClick={handleCloseModal} style={{
                        background: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#f9fafb' : '#374151', border: 'none', padding: '10px 20px',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', flex: 1
                      }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'relatorios' && (
          <Relatorios token={token} />
        )}
      </div>
    </div>
  );
}
