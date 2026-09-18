import React, { useEffect, useState } from 'react';
import { parseLocalDate, formatDateBR } from '../../utils/dateUtils';
import { useParams, useNavigate, Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import CurrencyInput from 'react-currency-input-field';
import { useTheme } from '../../contexts/ThemeContext';
import { usePermissions } from '../../hooks/usePermissions';
import './projetoDetalhes.css';
import CronogramaTab from './CronogramaTab';

export default function ProjetoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { hasPermission } = usePermissions();

  // Dados Globais
  const [projeto, setProjeto] = useState(null);
  const [recursosGlobais, setRecursosGlobais] = useState([]);
  const [equipesGlobais, setEquipesGlobais] = useState([]);

  // Dados da Obra
  const [recursosAlocados, setRecursosAlocados] = useState([]);
  const [equipesAlocadas, setEquipesAlocadas] = useState([]);
  const [custos, setCustos] = useState([]);

  const [activeTab, setActiveTab] = useState('visao-geral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modais
  const [isRecursoModalOpen, setIsRecursoModalOpen] = useState(false);
  const [isEquipeModalOpen, setIsEquipeModalOpen] = useState(false);

  // Formulário Recurso
  const [recursoSelecionado, setRecursoSelecionado] = useState('');
  const [quantidadeAlocada, setQuantidadeAlocada] = useState('');

  // Formulário Equipe
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Formulário Custos — Criar
  const [isCustoModalOpen, setIsCustoModalOpen] = useState(false);
  const [descricaoCusto, setDescricaoCusto] = useState('');
  const [valorCusto, setValorCusto] = useState('');
  const [dataCusto, setDataCusto] = useState('');

  // Formulário Custos — Editar
  const [isEditCustoModalOpen, setIsEditCustoModalOpen] = useState(false);
  const [custoEditando, setCustoEditando] = useState(null);
  const [descricaoEdit, setDescricaoEdit] = useState('');
  const [valorEdit, setValorEdit] = useState('');
  const [dataEdit, setDataEdit] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [id, token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProjeto(),
      fetchRecursosAlocados(),
      fetchEquipesAlocadas(),
      fetchRecursosGlobais(),
      fetchEquipesGlobais(),
      fetchCustos()
    ]);
    setLoading(false);
  };

  const fetchProjeto = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setProjeto(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchRecursosAlocados = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/recursos`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setRecursosAlocados(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchEquipesAlocadas = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/equipes`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setEquipesAlocadas(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchRecursosGlobais = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/recursos`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setRecursosGlobais(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchEquipesGlobais = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/equipes`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) setEquipesGlobais(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchCustos = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/custos`, { headers: { 'Authorization': `Bearer ${token}` }});
      if (res.ok) {
        const data = await res.json();
        setCustos(data.custos || []);
      }
    } catch (err) { console.error(err); }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  // Cálculos de Visão Geral
  const custoTotalRecursos = recursosAlocados.reduce((acc, curr) => acc + Number(curr.custo_total), 0);
  
  // O custo da equipe é (custo diário * número de dias)
  const calcularCustoEquipe = (equipe) => {
    const inicio = parseLocalDate(equipe.data_inicio);
    const fim = parseLocalDate(equipe.data_fim);
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para contar o dia de início
    return diffDays * Number(equipe.custo_diario_equipe);
  };
  
  const custoTotalEquipes = equipesAlocadas.reduce((acc, curr) => acc + calcularCustoEquipe(curr), 0);
  const custoTotalExtra = custos.reduce((acc, curr) => acc + Number(curr.valor), 0);
  const custoTotalObra = custoTotalRecursos + custoTotalEquipes + custoTotalExtra;

  // Porcentagem real do orçamento consumido (sem cap, para detectar estouro)
  const orcamentoTotal = Number(projeto?.orcamento_total) || 0;
  const percGasto = orcamentoTotal > 0 ? (custoTotalObra / orcamentoTotal) * 100 : 0;
  const orcamentoEstourado = percGasto > 100;

  // Handlers
  const handleAlocarRecurso = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_recurso: recursoSelecionado, quantidade_projeto: quantidadeAlocada })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao alocar recurso.');
      setRecursoSelecionado(''); setQuantidadeAlocada('');
      setIsRecursoModalOpen(false);
      fetchRecursosAlocados();
      fetchRecursosGlobais(); // para atualizar quantidade global
    } catch (err) { setError(err.message); }
  };

  const handleAlocarEquipe = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/equipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_equipe: equipeSelecionada, data_inicio: dataInicio, data_fim: dataFim })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao alocar equipe.');
      setEquipeSelecionada(''); setDataInicio(''); setDataFim('');
      setIsEquipeModalOpen(false);
      fetchEquipesAlocadas();
    } catch (err) { setError(err.message); }
  };

  const handleRemoverRecurso = async (idRecurso) => {
    if(!window.confirm("Remover recurso e devolver ao estoque?")) return;
    await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/recursos/${idRecurso}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchRecursosAlocados();
    fetchRecursosGlobais();
  };

  const handleRemoverEquipe = async (idMaoObra) => {
    if(!window.confirm("Desvincular equipe desta obra?")) return;
    await fetch(`http://localhost:3000/api/projetos/${id}/alocacao/equipes/${idMaoObra}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchEquipesAlocadas();
  };

  const handleAdicionarCusto = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/custos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ descricao: descricaoCusto, valor: parseFloat(valorCusto), data_registro: dataCusto || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao registrar custo.');
      setDescricaoCusto(''); setValorCusto(''); setDataCusto('');
      setIsCustoModalOpen(false);
      fetchCustos();
    } catch (err) { setError(err.message); }
  };

  const handleRemoverCusto = async (idCusto) => {
    if(!window.confirm("Remover este custo?")) return;
    await fetch(`http://localhost:3000/api/projetos/${id}/custos/${idCusto}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
    fetchCustos();
  };

  // Abre o modal de edição preenchido com os dados do registro selecionado
  const handleAbrirEdicaoCusto = (custo) => {
    setCustoEditando(custo);
    setDescricaoEdit(custo.descricao || '');
    // Garante que o valor é string numérica para o CurrencyInput (ex: '1500.50')
    setValorEdit(custo.valor !== undefined ? String(custo.valor) : '');
    // data_registro chega como 'YYYY-MM-DD' (parser do pg configurado)
    setDataEdit(custo.data_registro ? String(custo.data_registro).split('T')[0] : '');
    setIsEditCustoModalOpen(true);
    setError('');
  };

  const handleEditarCusto = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${id}/custos/${custoEditando.id_custo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          descricao: descricaoEdit,
          valor: parseFloat(valorEdit),
          data_registro: dataEdit || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao atualizar custo.');
      setIsEditCustoModalOpen(false);
      setCustoEditando(null);
      fetchCustos();
    } catch (err) { setError(err.message); }
  };

  if (loading || !projeto) {
    return <div className="loading-screen">Carregando detalhes da obra...</div>;
  }

  if (!hasPermission('obras_visualizar')) {
    return (
      <div className={`detalhes-layout ${isDarkMode ? 'dark' : ''}`}>
        <div className="empty-state" style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para visualizar as obras.</p>
          <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/dashboard')}>Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`detalhes-layout ${isDarkMode ? 'dark' : ''}`}>
      {/* HEADER DA OBRA */}
      <header className="detalhes-header">
        <div className="header-left">
          <IconButton onClick={() => navigate('/dashboard')} className="back-btn">
            <ArrowBackIcon />
          </IconButton>
          <div>
            <h1 className="obra-title">{projeto.nome_projeto}</h1>
            <span className={`status-badge ${projeto.status_projeto.toLowerCase().replace(/\s+/g, '-')}`}>
              {projeto.status_projeto}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="orcamento-box">
            <span className="orcamento-label">Orçamento Restante</span>
            <span className={`orcamento-value ${orcamentoEstourado || (orcamentoTotal > 0 && projeto.orcamento_total - custoTotalObra < 0) ? 'red' : 'green'}`}>
              {formatCurrency(projeto.orcamento_total - custoTotalObra)}
            </span>
          </div>
        </div>
      </header>

      {/* SUB NAV */}
      <nav className="detalhes-nav">
        <button className={activeTab === 'visao-geral' ? 'active' : ''} onClick={() => setActiveTab('visao-geral')}>
          <DashboardIcon fontSize="small" /> Visão Geral
        </button>
        <button className={activeTab === 'recursos' ? 'active' : ''} onClick={() => setActiveTab('recursos')}>
          <InventoryIcon fontSize="small" /> Materiais ({recursosAlocados.length})
        </button>
        <button className={activeTab === 'equipes' ? 'active' : ''} onClick={() => setActiveTab('equipes')}>
          <GroupsIcon fontSize="small" /> Equipes ({equipesAlocadas.length})
        </button>
        <button className={activeTab === 'cronograma' ? 'active' : ''} onClick={() => setActiveTab('cronograma')}>
          <TimelineIcon fontSize="small" /> Cronograma e Avanço
        </button>
        <button className={activeTab === 'financeiro' ? 'active' : ''} onClick={() => setActiveTab('financeiro')}>
          <AttachMoneyIcon fontSize="small" /> Financeiro
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}
      <main className="detalhes-content">
        {activeTab === 'cronograma' && (
          <CronogramaTab idProjeto={id} />
        )}
        
        {/* TAB VISÃO GERAL */}
        {activeTab === 'visao-geral' && (
          <div className="visao-geral-grid">

            {/* CARD: PROGRESSO FINANCEIRO */}
            <div
              className="resumo-card"
              style={orcamentoEstourado ? {
                border: '2px solid #ef4444',
                boxShadow: '0 0 0 3px rgba(239,68,68,0.15)'
              } : {}}
            >
              {/* Badge de alerta quando estourado */}
              {orcamentoEstourado && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  marginBottom: '12px',
                  color: '#b91c1c',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  animation: 'pulse-alert 1.5s ease-in-out infinite'
                }}>
                  ⚠️ Orçamento estourado! ({percGasto.toFixed(1)}% do planejado)
                </div>
              )}

              <h3>Progresso Financeiro</h3>

              {/* Barra de progresso */}
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(percGasto, 100)}%`,
                    background: orcamentoEstourado
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : percGasto >= 80
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #2e6bee, #10b981)',
                    transition: 'width 0.5s ease, background 0.4s ease'
                  }}
                />
              </div>

              {/* Labels de gasto / orçamento */}
              <div className="progress-labels" style={{ marginTop: '8px' }}>
                <span style={{
                  fontWeight: orcamentoEstourado ? '700' : '600',
                  color: orcamentoEstourado ? '#dc2626' : 'inherit'
                }}>
                  Gasto: {formatCurrency(custoTotalObra)}
                  {orcamentoEstourado && (
                    <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: '#dc2626' }}>
                      (+{formatCurrency(custoTotalObra - orcamentoTotal)} acima)
                    </span>
                  )}
                </span>
                <span>Planejado: {formatCurrency(orcamentoTotal)}</span>
              </div>

              {/* Mini barra de percentual */}
              <div style={{ marginTop: '10px', fontSize: '0.8rem', color: orcamentoEstourado ? '#dc2626' : '#6b7280', textAlign: 'right', fontWeight: '600' }}>
                {percGasto.toFixed(1)}% consumido
              </div>
            </div>

            <div className="resumo-card">
              <h3>Custo com Materiais</h3>
              <div className="big-value text-blue">{formatCurrency(custoTotalRecursos)}</div>
            </div>
            
            <div className="resumo-card">
              <h3>Custo com Mão de Obra</h3>
              <div className="big-value text-orange">{formatCurrency(custoTotalEquipes)}</div>
            </div>

            <div className="resumo-card">
              <h3>Custos Extras Registrados</h3>
              <div className="big-value text-red">{formatCurrency(custoTotalExtra)}</div>
            </div>
          </div>
        )}

        {/* TAB RECURSOS */}
        {activeTab === 'recursos' && (
          <div className="tab-section">
            <div className="section-header">
              <h2>Materiais e Equipamentos na Obra</h2>
              {hasPermission('obras_criar') && (
                <button className="btn-primary" onClick={() => setIsRecursoModalOpen(true)}>
                  <AddIcon /> Alocar do Estoque
                </button>
              )}
            </div>
            
            {recursosAlocados.length === 0 ? (
              <p className="text-muted">Nenhum recurso alocado nesta obra ainda.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Recurso</th>
                    <th>Tipo</th>
                    <th>Qtd. Alocada</th>
                    <th>Custo Total</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {recursosAlocados.map(r => (
                    <tr key={r.id_recurso}>
                      <td className="fw-bold">{r.nome}</td>
                      <td>{r.tipo || '-'}</td>
                      <td>{r.quantidade_projeto}</td>
                      <td className="fw-bold text-blue">{formatCurrency(r.custo_total)}</td>
                      <td>
                        {hasPermission('obras_criar') && (
                          <IconButton size="small" color="error" onClick={() => handleRemoverRecurso(r.id_recurso)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB EQUIPES */}
        {activeTab === 'equipes' && (
          <div className="tab-section">
            <div className="section-header">
              <h2>Mão de Obra Alocada</h2>
              {hasPermission('alocacoes_vincular') && (
                <button className="btn-primary" onClick={() => setIsEquipeModalOpen(true)}>
                  <AddIcon /> Alocar Equipe
                </button>
              )}
            </div>
            
            {equipesAlocadas.length === 0 ? (
              <p className="text-muted">Nenhuma equipe trabalhando nesta obra.</p>
            ) : (
              <div className="equipes-list">
                {equipesAlocadas.map(eq => {
                  const dias = Math.ceil(Math.abs(parseLocalDate(eq.data_fim) - parseLocalDate(eq.data_inicio)) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <div className="equipe-alocada-card" key={eq.id_mao_obra}>
                      <div className="eq-header">
                        <h3>{eq.nome_equipe}</h3>
                        {hasPermission('alocacoes_vincular') && (
                          <IconButton size="small" color="error" onClick={() => handleRemoverEquipe(eq.id_mao_obra)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                      <div className="eq-body">
                        <p><strong>Período:</strong> {formatDateBR(eq.data_inicio)} até {formatDateBR(eq.data_fim)} ({dias} dias)</p>
                        <p><strong>Custo Diário:</strong> {formatCurrency(eq.custo_diario_equipe)}</p>
                        <p className="eq-cost"><strong>Custo Total Projetado:</strong> {formatCurrency(calcularCustoEquipe(eq))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB FINANCEIRO (CUSTOS) */}
        {activeTab === 'financeiro' && (
          <div className="tab-section">
            <div className="section-header">
              <h2>Lançamentos Financeiros da Obra</h2>
              {hasPermission('financeiro_custos') && (
                <button className="btn-primary" onClick={() => setIsCustoModalOpen(true)}>
                  <AddIcon /> Registrar Despesa
                </button>
              )}
            </div>
            
            {custos.length === 0 ? (
              <p className="text-muted">Nenhum custo extra lançado nesta obra.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {custos.map(c => (
                    <tr key={c.id_custo}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateBR(c.data_registro)}</td>
                      <td className="fw-bold">{c.descricao}</td>
                      <td className="highlight-text text-red">{formatCurrency(c.valor)}</td>
                      <td style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                        {hasPermission('financeiro_custos') && (
                          <>
                            <IconButton
                              size="small"
                              color="primary"
                              title="Editar lançamento"
                              onClick={() => handleAbrirEdicaoCusto(c)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Excluir lançamento"
                              onClick={() => handleRemoverCusto(c.id_custo)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* MODAL RECURSO */}
      {isRecursoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Alocar Recurso do Estoque</h2>
              <IconButton onClick={() => setIsRecursoModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleAlocarRecurso} className="modal-form">
              <div className="form-group">
                <label>Recurso Disponível no Estoque</label>
                <select value={recursoSelecionado} onChange={e => setRecursoSelecionado(e.target.value)} required>
                  <option value="" disabled>Selecione um recurso...</option>
                  {recursosGlobais.filter(r => r.quantidade > 0).map(r => (
                    <option key={r.id_recurso} value={r.id_recurso}>{r.nome} (Disponível: {r.quantidade})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantidade a Alocar</label>
                <input type="number" min="1" value={quantidadeAlocada} onChange={e => setQuantidadeAlocada(e.target.value)} required />
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsRecursoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Alocar</button>
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
              <h2>Alocar Equipe na Obra</h2>
              <IconButton onClick={() => setIsEquipeModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleAlocarEquipe} className="modal-form">
              <div className="form-group">
                <label>Equipe</label>
                <select value={equipeSelecionada} onChange={e => setEquipeSelecionada(e.target.value)} required>
                  <option value="" disabled>Selecione uma equipe...</option>
                  {equipesGlobais.map(eq => (
                    <option key={eq.id_equipe} value={eq.id_equipe}>{eq.nome_equipe}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Data de Início</label>
                  <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Data Final (Previsão)</label>
                  <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} required />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsEquipeModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Alocar Equipe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CUSTO — CRIAR */}
      {isCustoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Registrar Nova Despesa</h2>
              <IconButton onClick={() => setIsCustoModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleAdicionarCusto} className="modal-form">
              <div className="form-group">
                <label>Descrição do Custo *</label>
                <input type="text" value={descricaoCusto} onChange={e => setDescricaoCusto(e.target.value)} required placeholder="Ex: Aluguel de Caçamba" />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Valor *</label>
                  <CurrencyInput
                    id="valorCusto"
                    name="valorCusto"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    prefix="R$ "
                    value={valorCusto === '' ? undefined : valorCusto}
                    onValueChange={(value) => setValorCusto(value)}
                  />
                </div>
                <div className="form-group half">
                  <label>Data</label>
                  <input type="date" value={dataCusto} onChange={e => setDataCusto(e.target.value)} />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsCustoModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CUSTO — EDITAR */}
      {isEditCustoModalOpen && custoEditando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Editar Lançamento Financeiro</h2>
              <IconButton onClick={() => { setIsEditCustoModalOpen(false); setError(''); }}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleEditarCusto} className="modal-form">
              <div className="form-group">
                <label>Descrição *</label>
                <input
                  type="text"
                  value={descricaoEdit}
                  onChange={e => setDescricaoEdit(e.target.value)}
                  required
                  placeholder="Ex: Aluguel de Caçamba"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Valor *</label>
                  <CurrencyInput
                    id="valorEdit"
                    name="valorEdit"
                    placeholder="R$ 0,00"
                    decimalsLimit={2}
                    decimalSeparator=","
                    groupSeparator="."
                    prefix="R$ "
                    value={valorEdit === '' ? undefined : valorEdit}
                    onValueChange={(value) => setValorEdit(value || '')}
                  />
                </div>
                <div className="form-group half">
                  <label>Data</label>
                  <input
                    type="date"
                    value={dataEdit}
                    onChange={e => setDataEdit(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => { setIsEditCustoModalOpen(false); setError(''); }}>Cancelar</button>
                <button type="submit" className="btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
