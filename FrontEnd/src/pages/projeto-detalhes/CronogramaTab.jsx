import React, { useState, useEffect } from 'react';
import { parseLocalDate, formatDateBR, isDateValid } from '../../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { usePermissions } from '../../hooks/usePermissions';
import { useTheme } from '../../contexts/ThemeContext';
import './projetoDetalhes.css'; 

export default function CronogramaTab({ idProjeto }) {
  const { hasPermission } = usePermissions();
  const { isDarkMode } = useTheme();
  const [etapas, setEtapas] = useState([]);
  const [curvaS, setCurvaS] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  
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
  const [nomeTarefaEdit, setNomeTarefaEdit] = useState('');

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
      if(res.ok) {
        const rawData = await res.json();
        const numericData = rawData.map(item => ({
          ...item,
          planejado: Number(item.planejado) || 0,
          realizado: Number(item.realizado) || 0
        }));
        setCurvaS(numericData);
      }
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
          data_fim_real: dataFimReal || null,
          nome_tarefa: nomeTarefaEdit
        })
      });
      if (!res.ok) throw new Error('Falha ao atualizar progresso.');
      setProgressoModal({ isOpen: false, etapa: null });
      fetchData();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };


  const handleExportExcel = () => {
    const dataToExport = etapas.map(e => ({
      'EDT': e.codigo_edt,
      'Nome da Tarefa': e.nome_tarefa,
      'Status': e.status_farol,
      'Duração Prevista (Dias)': e.duracao_dias,
      'Peso Financeiro (%)': (Number(e.peso_financeiro) * 100).toFixed(2),
      'Avanço Realizado (%)': Number(e.execucao_real_perc).toFixed(2),
      'Data Início Prevista': formatDateBR(e.data_inicio_planejada),
      'Data Fim Prevista': formatDateBR(e.data_fim_planejada),
      'Data Fim Real': e.data_fim_real ? formatDateBR(e.data_fim_real) : 'Não registrada',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cronograma");
    XLSX.writeFile(wb, `Cronograma_Obras_${idProjeto}.xlsx`);
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      let ganttImage = null;
      let curvaSImage = null;

      const ganttEl = document.getElementById('gantt-chart-container');
      if (ganttEl) {
        const canvasG = await html2canvas(ganttEl, { scale: 2 });
        ganttImage = canvasG.toDataURL('image/png');
      }

      const curvaEl = document.getElementById('curvas-chart-container');
      if (curvaEl) {
        const canvasC = await html2canvas(curvaEl, { scale: 2 });
        curvaSImage = canvasC.toDataURL('image/png');
      }

      const res = await fetch(`http://localhost:3000/api/projetos/${idProjeto}/exportar/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nomeProjeto: 'Obra ' + idProjeto, ganttImage, curvaSImage })
      });

      if (!res.ok) throw new Error("Erro ao gerar PDF.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ORC_Relatorio_Projeto_${idProjeto}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Falha ao exportar PDF: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrar tarefas inválidas do Gantt
  const { validEtapas, invalidCount } = React.useMemo(() => {
    const valid = etapas.filter(e => isDateValid(e.data_inicio_planejada) && isDateValid(e.data_fim_planejada));
    return { validEtapas: valid, invalidCount: etapas.length - valid.length };
  }, [etapas]);

  const ganttTasks = React.useMemo(() => {
    return validEtapas.map((e) => {
      // Usa parseLocalDate para evitar o bug de timezone (dia -1 no fuso -03:00)
      let start = parseLocalDate(e.data_inicio_planejada);
      let end = parseLocalDate(e.data_fim_planejada);
      
      // Prevent start >= end 
      if(start.getTime() >= end.getTime()){
         end = new Date(start.getTime());
         end.setDate(end.getDate() + 1);
      }

      // Cores por status
      const isAtrasada = e.status_farol === 'ATRASADA';
      const isConcluida = e.status_farol === 'CONCLUÍDA';
      const progressColor = isAtrasada ? '#ef4444' : isConcluida ? '#10b981' : '#3b82f6';
      const progressSelectedColor = isAtrasada ? '#b91c1c' : isConcluida ? '#059669' : '#2563eb';
      const bgColor = isAtrasada ? '#fca5a5' : '#93c5fd';

      return {
        start: start,
        end: end,
        name: `${e.codigo_edt} - ${e.nome_tarefa}`,
        id: String(e.id_etapa),
        type: 'task',
        progress: Number(e.execucao_real_perc) || 0,
        isDisabled: !hasPermission('obras_criar'),
        // Dados extras para o tooltip customizado
        displayOrder: e.id_etapa,
        styles: { 
          progressColor,
          progressSelectedColor,
          backgroundColor: bgColor,
          backgroundSelectedColor: isAtrasada ? '#f87171' : '#60a5fa'
        }
      };
    });
  }, [validEtapas, hasPermission]);

  const getColumnWidth = () => {
    switch (viewMode) {
      case ViewMode.Day: return 60;
      case ViewMode.Week: return 120;
      case ViewMode.Month: return 250;
      default: return 60;
    }
  };

  // Hack para traduzir o "W" (Week) para "Sem" na visão semanal
  useEffect(() => {
    if (viewMode === ViewMode.Week) {
      const timer = setTimeout(() => {
        const texts = document.querySelectorAll('#gantt-chart-container svg text');
        texts.forEach(t => {
          if (t.textContent && t.textContent.trim().startsWith('W')) {
            t.textContent = t.textContent.replace('W', 'Sem ');
          }
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, ganttTasks]);

  // Tooltip customizado do Gantt com Data Fim Real
  const CustomTooltipContent = React.useMemo(() => {
    return ({ task, fontSize, fontFamily }) => {
      const etapa = etapas.find(e => String(e.id_etapa) === task.id);
      if (!etapa) return null;
      const isAtrasada = etapa.status_farol === 'ATRASADA';
      const isConcluida = etapa.status_farol === 'CONCLUÍDA';
      return (
        <div style={{
          background: '#1f2937', color: '#f9fafb', padding: '12px 16px',
          borderRadius: '8px', fontFamily, fontSize,
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          border: `2px solid ${isAtrasada ? '#ef4444' : isConcluida ? '#10b981' : '#3b82f6'}`,
          minWidth: '220px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '0.9rem' }}>
            {etapa.codigo_edt} — {etapa.nome_tarefa}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.82rem', color: '#d1d5db' }}>
            <span>📅 <strong>Início Previsto:</strong> {formatDateBR(etapa.data_inicio_planejada)}</span>
            <span>📅 <strong>Fim Previsto:</strong> {formatDateBR(etapa.data_fim_planejada)}</span>
            {etapa.data_fim_real && (
              <span style={{ color: isConcluida ? '#34d399' : '#f87171' }}>
                {isConcluida ? '✅' : '⚠️'} <strong>Fim Real:</strong> {formatDateBR(etapa.data_fim_real)}
              </span>
            )}
            <span>📊 <strong>Avanço:</strong> {Number(etapa.execucao_real_perc).toFixed(1)}%</span>
            <span style={{ marginTop: '4px', fontWeight: 'bold', color: isAtrasada ? '#f87171' : isConcluida ? '#34d399' : '#60a5fa' }}>
              {isAtrasada ? '🔴 ATRASADA' : isConcluida ? '🟢 CONCLUÍDA' : '🔵 EM PROGRESSO'}
            </span>
          </div>
        </div>
      );
    };
  }, [etapas]);

  const CustomTaskListHeader = React.useMemo(() => {
    return ({ headerHeight, fontFamily, fontSize }) => (
      <div style={{ display: 'flex', height: headerHeight, fontFamily, fontSize, background: '#f9fafb', borderBottom: '1px solid #e5e7eb', alignItems: 'center', color: '#6b7280', fontWeight: 'bold' }}>
        <div style={{ flex: 1, paddingLeft: '10px', minWidth: '150px' }}>Nome da Tarefa</div>
        <div style={{ width: '80px', borderLeft: '1px solid #e5e7eb', paddingLeft: '5px' }}>Início</div>
        <div style={{ width: '80px', borderLeft: '1px solid #e5e7eb', paddingLeft: '5px' }}>Fim</div>
      </div>
    );
  }, []);

  const CustomTaskListTable = React.useMemo(() => {
    return ({ rowHeight, rowWidth, tasks, fontFamily, fontSize }) => (
      <div>
        {tasks.map((t, i) => (
          <div key={i} style={{ display: 'flex', height: rowHeight, fontFamily, fontSize, borderBottom: '1px solid #e5e7eb', alignItems: 'center', background: '#fff', color: '#374151', cursor: 'pointer' }} onClick={() => {
              if(!hasPermission('obras_criar')) return;
              const etapa = etapas.find(e => String(e.id_etapa) === t.id);
              if(etapa) {
                setProgressoModal({ isOpen: true, etapa });
                setProgressoPerc(etapa.execucao_real_perc);
                setDataFimReal(etapa.data_fim_real ? String(etapa.data_fim_real).split('T')[0] : '');
              }
          }}>
            <div style={{ flex: 1, paddingLeft: '10px', minWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t.name}>{t.name}</div>
            <div style={{ width: '80px', borderLeft: '1px solid #e5e7eb', paddingLeft: '5px', fontSize: '0.85rem' }}>{t.start.toLocaleDateString('pt-BR')}</div>
            <div style={{ width: '80px', borderLeft: '1px solid #e5e7eb', paddingLeft: '5px', fontSize: '0.85rem' }}>{t.end.toLocaleDateString('pt-BR')}</div>
          </div>
        ))}
      </div>
    );
  }, [hasPermission, etapas]);

  return (
    <div className="cronograma-container">
      
      {/* ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <button className="btn-secondary" onClick={handleExportExcel} style={{display: 'flex', alignItems: 'center'}}>
          <TableViewIcon fontSize="small" style={{marginRight: '5px'}} /> Excel
        </button>
        <button className="btn-secondary" onClick={handleExportPDF} disabled={exportLoading} style={{display: 'flex', alignItems: 'center'}}>
          <PictureAsPdfIcon fontSize="small" style={{marginRight: '5px'}} /> 
          {exportLoading ? 'Gerando...' : 'PDF'}
        </button>
        {hasPermission('obras_criar') && (
          <button className="btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
            <AddIcon fontSize="small" style={{marginRight: '8px'}} /> Nova Etapa
          </button>
        )}
      </div>

      <div id="curvas-chart-container" className="chart-section" style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--border-color, #e5e7eb)' }}>
        <h3 style={{marginBottom: '20px', fontSize: '1.2rem', color: 'var(--text-primary)'}}>Curva S (Avanço Físico-Financeiro)</h3>
        {curvaS.length > 0 ? (
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
              <LineChart data={curvaS} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e5e7eb)" />
                <XAxis 
                  dataKey="data" 
                  tickFormatter={formatDateBR} 
                  stroke="var(--text-secondary)" 
                  minTickGap={30}
                  tick={{ fontSize: 12 }} 
                />
                <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} stroke="var(--text-secondary)" />
                <Tooltip 
                  formatter={(val, name) => [`${Number(val || 0).toFixed(2)}%`, name === 'Avanço Planejado' ? 'Avanço Planejado Acum.' : 'Avanço Realizado Acum.']}
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

      <div id="gantt-chart-container" style={{ background: 'var(--bg-card, #fff)', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid var(--border-color, #e5e7eb)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>Gráfico de Gantt Interativo</h3>
            {invalidCount > 0 && (
               <p style={{ color: '#ea580c', fontSize: '0.85rem', marginTop: '5px' }}>
                 ⚠️ {invalidCount} tarefa(s) não estão sendo exibidas por possuírem datas inválidas. Edite-as na tabela abaixo.
               </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Visualização:</span>
            <select 
               value={viewMode} 
               onChange={(e) => setViewMode(e.target.value)}
               style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            >
              <option value={ViewMode.Day}>Diário</option>
              <option value={ViewMode.Week}>Semanal</option>
              <option value={ViewMode.Month}>Mensal</option>
            </select>
          </div>
        </div>
        
        {ganttTasks.length > 0 ? (
          <Gantt 
            tasks={ganttTasks} 
            viewMode={viewMode}
            locale="pt-BR"
            listCellWidth="310px"
            columnWidth={getColumnWidth()}
            TaskListHeader={CustomTaskListHeader}
            TaskListTable={CustomTaskListTable}
            TooltipContent={CustomTooltipContent}
            onDoubleClick={(task) => {
              if(!hasPermission('obras_criar')) return;
              const etapa = etapas.find(e => String(e.id_etapa) === task.id);
              if(etapa) {
                setProgressoModal({ isOpen: true, etapa: etapa });
                setProgressoPerc(etapa.execucao_real_perc);
                setDataFimReal(etapa.data_fim_real ? String(etapa.data_fim_real).split('T')[0] : '');
              }
            }}
          />
        ) : (
          <div className="empty-state">Adicione tarefas para visualizar o Gantt.</div>
        )}
      </div>

      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>Tabela de Controle (EDT)</h3>
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
                <th>Realizado (%)</th>
                <th>Início Previsto</th>
                <th>Fim Previsto</th>
                <th style={{ color: '#ef4444' }}>Fim Real</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {etapas.map(e => {
                const isAtrasada = e.status_farol === 'ATRASADA';
                const isConcluida = e.status_farol === 'CONCLUÍDA';
                const rowBg = isAtrasada ? 'rgba(239,68,68,0.07)' : isConcluida ? 'rgba(16,185,129,0.07)' : 'transparent';
                return (
                <tr key={e.id_etapa} style={{ background: rowBg }}>
                  <td className="fw-bold">{e.codigo_edt}</td>
                  <td>{e.nome_tarefa}</td>
                  <td>
                    <span className={`status-badge ${e.status_farol.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}>
                      {e.status_farol}
                    </span>
                  </td>
                  <td>{(Number(e.peso_financeiro) * 100).toFixed(2)}%</td>
                  <td className="highlight-text">{Number(e.execucao_real_perc).toFixed(2)}%</td>
                  <td>{formatDateBR(e.data_inicio_planejada)}</td>
                  <td>{formatDateBR(e.data_fim_planejada)}</td>
                  <td style={{ fontWeight: e.data_fim_real ? '600' : 'normal', color: e.data_fim_real ? (isConcluida ? '#059669' : '#dc2626') : '#9ca3af' }}>
                    {e.data_fim_real ? formatDateBR(e.data_fim_real) : '—'}
                  </td>
                  <td>
                    {hasPermission('obras_criar') && (
                      <IconButton size="small" color="primary" onClick={() => {
                        setProgressoModal({ isOpen: true, etapa: e });
                        setProgressoPerc(e.execucao_real_perc);
                        setDataFimReal(e.data_fim_real ? String(e.data_fim_real).split('T')[0] : '');
                        setNomeTarefaEdit(e.nome_tarefa);
                      }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                  </td>
                </tr>
              )})}
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
                <label>Tarefa Selecionada</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ padding: '10px', background: isDarkMode ? '#374151' : '#f3f4f6', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, color: isDarkMode ? '#f9fafb' : '#111827', borderRadius: '6px', fontWeight: 'bold' }}>
                    {progressoModal.etapa.codigo_edt}
                  </div>
                  <input type="text" value={nomeTarefaEdit} onChange={e => setNomeTarefaEdit(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
                </div>
                {/* Datas planejadas para referência */}
                <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#6b7280', display: 'flex', gap: '12px' }}>
                  <span>📅 Previsto: {formatDateBR(progressoModal.etapa.data_inicio_planejada)} → {formatDateBR(progressoModal.etapa.data_fim_planejada)}</span>
                </div>
              </div>
              <div className="form-group">
                <label>% Executada Real *</label>
                <input type="number" step="0.01" min="0" max="100" value={progressoPerc} onChange={e=>setProgressoPerc(e.target.value)} required placeholder="Ex: 50.00" />
              </div>
              <div className="form-group">
                <label>Data de Fim Real <span style={{ color: '#6b7280', fontWeight: 'normal', fontSize: '0.85rem' }}>(preencha quando a etapa for concluída)</span></label>
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
