import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyInput from 'react-currency-input-field';
import './projetoDetalhes.css'; // reaproveitar os modais e tabelas

export default function CronogramaTab({ idProjeto }) {
  const [etapas, setEtapas] = useState([]);
  const [curvaS, setCurvaS] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form Nova Etapa
  const [codigoEdt, setCodigoEdt] = useState('');
  const [nomeTarefa, setNomeTarefa] = useState('');
  const [pesoFinanceiro, setPesoFinanceiro] = useState('');
  const [duracaoDias, setDuracaoDias] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Form Atualizar Progresso
  const [progressoModal, setProgressoModal] = useState({ isOpen: false, etapa: null });
  const [progressoPerc, setProgressoPerc] = useState('');
  const [dataFimReal, setDataFimReal] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [idProjeto]);

  const fetchData = async () => {
    await fetchEtapas();
    await fetchCurvaS();
  };

  const fetchEtapas = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${idProjeto}/cronograma/etapas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) setEtapas(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchCurvaS = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${idProjeto}/cronograma/curvas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if(res.ok) setCurvaS(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleCriarEtapa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pesoDecimal = parseFloat(pesoFinanceiro) / 100;
      
      const res = await fetch(`http://localhost:3000/api/projetos/${idProjeto}/cronograma/etapas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          codigo_edt: codigoEdt,
          nome_tarefa: nomeTarefa,
          peso_financeiro: pesoDecimal,
          duracao_dias: parseInt(duracaoDias),
          data_inicio_planejada: dataInicio,
          data_fim_planejada: dataFim
        })
      });
      
      if (!res.ok) throw new Error('Falha ao criar etapa.');
      setIsModalOpen(false);
      setCodigoEdt(''); setNomeTarefa(''); setPesoFinanceiro(''); setDuracaoDias(''); setDataInicio(''); setDataFim('');
      fetchData();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleAtualizarProgresso = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/projetos/${idProjeto}/cronograma/etapas/${progressoModal.etapa.id_etapa}/progresso`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          execucao_real_perc: parseFloat(progressoPerc),
          data_fim_real: dataFimReal || null
        })
      });
      if (!res.ok) throw new Error('Falha ao atualizar progresso.');
      setProgressoModal({ isOpen: false, etapa: null });
      fetchData();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const formatDateBR = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="cronograma-container">
      <div className="chart-section" style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--border-color, #e5e7eb)' }}>
        <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)'}}>Curva S (Avanço Físico-Financeiro)</h3>
        {curvaS.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={curvaS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e5e7eb)" />
                <XAxis dataKey="data" tickFormatter={formatDateBR} stroke="var(--text-secondary)" />
                <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} stroke="var(--text-secondary)" />
                <Tooltip 
                  formatter={(val, name) => [`${val}%`, name === 'planejado' ? 'Avanço Planejado' : 'Avanço Realizado']}
                  labelFormatter={formatDateBR}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="planejado" name="Avanço Planejado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="realizado" name="Avanço Realizado" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="empty-state">
            <p>Cadastre etapas com datas para visualizar o gráfico da Curva S.</p>
          </div>
        )}
      </div>

      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Estrutura Analítica do Projeto (EDT)</h3>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <AddIcon fontSize="small" style={{marginRight: '8px'}} />
          Nova Etapa
        </button>
      </div>

      <div className="table-container">
        {etapas.length === 0 ? (
          <div className="empty-state">Nenhuma etapa cadastrada no cronograma.</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>EDT</th>
                <th>Nome da Tarefa</th>
                <th>Status</th>
                <th>Peso (%)</th>
                <th>Previsto</th>
                <th>Realizado</th>
                <th>Data Fim Prevista</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {etapas.map(e => (
                <tr key={e.id_etapa}>
                  <td className="fw-bold">{e.codigo_edt}</td>
                  <td>{e.nome_tarefa}</td>
                  <td>
                    <span className={`status-badge ${e.status_farol.toLowerCase().replace(/\s+/g, '-')}`}>
                      {e.status_farol}
                    </span>
                  </td>
                  <td>{(Number(e.peso_financeiro) * 100).toFixed(2)}%</td>
                  <td>-</td>
                  <td className="highlight-text">{Number(e.execucao_real_perc).toFixed(2)}%</td>
                  <td>{formatDateBR(e.data_fim_planejada)}</td>
                  <td>
                    <IconButton size="small" color="primary" onClick={() => {
                      setProgressoModal({ isOpen: true, etapa: e });
                      setProgressoPerc(e.execucao_real_perc);
                      setDataFimReal(e.data_fim_real ? e.data_fim_real.split('T')[0] : '');
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Nova Etapa (EDT)</h2>
              <IconButton onClick={() => setIsModalOpen(false)}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleCriarEtapa} className="modal-form">
              <div className="form-row">
                <div className="form-group half">
                  <label>Código EDT *</label>
                  <input type="text" value={codigoEdt} onChange={e=>setCodigoEdt(e.target.value)} required placeholder="Ex: 1.1" />
                </div>
                <div className="form-group half">
                  <label>Duração Prevista (dias) *</label>
                  <input type="number" value={duracaoDias} onChange={e=>setDuracaoDias(e.target.value)} required min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Nome da Tarefa *</label>
                <input type="text" value={nomeTarefa} onChange={e=>setNomeTarefa(e.target.value)} required placeholder="Ex: Mobilização de Equipamentos" />
              </div>
              <div className="form-group">
                <label>Peso Financeiro da Obra (%) *</label>
                <input type="number" step="0.01" value={pesoFinanceiro} onChange={e=>setPesoFinanceiro(e.target.value)} required placeholder="Ex: 7.50" />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Data de Início Prevista *</label>
                  <input type="date" value={dataInicio} onChange={e=>setDataInicio(e.target.value)} required />
                </div>
                <div className="form-group half">
                  <label>Data de Fim Prevista *</label>
                  <input type="date" value={dataFim} onChange={e=>setDataFim(e.target.value)} required />
                </div>
              </div>
              {error && <p className="error-message">{error}</p>}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={()=>setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Etapa'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {progressoModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '400px'}}>
            <div className="modal-header">
              <h2>Atualizar Avanço Real</h2>
              <IconButton onClick={() => setProgressoModal({ isOpen: false, etapa: null })}><CloseIcon /></IconButton>
            </div>
            <form onSubmit={handleAtualizarProgresso} className="modal-form">
              <div className="form-group">
                <label>Tarefa</label>
                <input type="text" value={progressoModal.etapa.nome_tarefa} disabled />
              </div>
              <div className="form-group">
                <label>% Executada Real *</label>
                <input type="number" step="0.01" min="0" max="100" value={progressoPerc} onChange={e=>setProgressoPerc(e.target.value)} required placeholder="Ex: 50.00" />
              </div>
              <div className="form-group">
                <label>Data de Fim Real (Se concluída)</label>
                <input type="date" value={dataFimReal} onChange={e=>setDataFimReal(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={()=>setProgressoModal({ isOpen: false, etapa: null })}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Atualizando...' : 'Atualizar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
