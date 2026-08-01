import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../../contexts/ThemeContext';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InventoryIcon from '@mui/icons-material/Inventory';
import DomainIcon from '@mui/icons-material/Domain';
import EngineeringIcon from '@mui/icons-material/Engineering';

export default function Relatorios({ token }) {
  const { isDarkMode } = useTheme();
  const [recursos, setRecursos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroQuantidadeMin, setFiltroQuantidadeMin] = useState('');
  const [filtroQuantidadeMax, setFiltroQuantidadeMax] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCustoMin, setFiltroCustoMin] = useState('');
  const [filtroCustoMax, setFiltroCustoMax] = useState('');
  const [ordenacao, setOrdenacao] = useState('padrao');
  
  // Estados para Projetos
  const [projetos, setProjetos] = useState([]);
  const [filtroNomeProjeto, setFiltroNomeProjeto] = useState('');
  const [filtroStatusProjeto, setFiltroStatusProjeto] = useState('');
  const [filtroOrcamentoMin, setFiltroOrcamentoMin] = useState('');
  const [filtroOrcamentoMax, setFiltroOrcamentoMax] = useState('');
  const [filtroDataInicioMin, setFiltroDataInicioMin] = useState('');
  const [filtroDataInicioMax, setFiltroDataInicioMax] = useState('');
  const [ordenacaoProjeto, setOrdenacaoProjeto] = useState('padrao');

  // Estados para Trabalhadores
  const [trabalhadores, setTrabalhadores] = useState([]);
  const [filtroNomeTrabalhador, setFiltroNomeTrabalhador] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroRemuneracaoMin, setFiltroRemuneracaoMin] = useState('');
  const [filtroRemuneracaoMax, setFiltroRemuneracaoMax] = useState('');
  const [filtroTipoPagamento, setFiltroTipoPagamento] = useState('');
  const [ordenacaoTrabalhador, setOrdenacaoTrabalhador] = useState('padrao');

  // Controle de qual relatório está visível
  const [relatorioAtivo, setRelatorioAtivo] = useState('obras');

  const [loading, setLoading] = useState(false);
  const [loadingProjetos, setLoadingProjetos] = useState(false);
  const [loadingTrabalhadores, setLoadingTrabalhadores] = useState(false);

  useEffect(() => {
    fetchRecursos();
    fetchProjetos();
    fetchTrabalhadores();
  }, [token]);

  const fetchProjetos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/projetos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjetos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar projetos para relatório:", err);
    }
  };

  const fetchRecursos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/recursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecursos(data);
      }
    } catch (err) {
      console.error("Erro ao buscar recursos para relatório:", err);
    }
  };

  const fetchTrabalhadores = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trabalhadores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrabalhadores(data);
      }
    } catch (err) {
      console.error("Erro ao buscar trabalhadores para relatório:", err);
    }
  };

  const handleExportExcel = () => {
    setLoading(true);

    // Filtrar dados
    let dadosFiltrados = [...recursos];

    if (filtroTipo) {
      dadosFiltrados = dadosFiltrados.filter(r => 
        r.tipo && r.tipo.toLowerCase() === filtroTipo.toLowerCase()
      );
    }

    if (filtroNome) {
      dadosFiltrados = dadosFiltrados.filter(r => 
        r.nome && r.nome.toLowerCase().includes(filtroNome.toLowerCase())
      );
    }

    if (filtroQuantidadeMin !== '') {
      dadosFiltrados = dadosFiltrados.filter(r => r.quantidade >= Number(filtroQuantidadeMin));
    }
    if (filtroQuantidadeMax !== '') {
      dadosFiltrados = dadosFiltrados.filter(r => r.quantidade <= Number(filtroQuantidadeMax));
    }

    if (filtroCustoMin !== '') {
      dadosFiltrados = dadosFiltrados.filter(r => r.custo_unitario >= Number(filtroCustoMin));
    }
    if (filtroCustoMax !== '') {
      dadosFiltrados = dadosFiltrados.filter(r => r.custo_unitario <= Number(filtroCustoMax));
    }

    // Ordenação
    if (ordenacao === 'nome_asc') {
      dadosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (ordenacao === 'nome_desc') {
      dadosFiltrados.sort((a, b) => b.nome.localeCompare(a.nome));
    } else if (ordenacao === 'qnt_asc') {
      dadosFiltrados.sort((a, b) => a.quantidade - b.quantidade);
    } else if (ordenacao === 'qnt_desc') {
      dadosFiltrados.sort((a, b) => b.quantidade - a.quantidade);
    } else if (ordenacao === 'custo_total_desc') {
      dadosFiltrados.sort((a, b) => (b.quantidade * b.custo_unitario) - (a.quantidade * a.custo_unitario));
    }

    if (dadosFiltrados.length === 0) {
      alert("Nenhum recurso encontrado com estes filtros.");
      setLoading(false);
      return;
    }

    // Formatar dados para o Excel
    const dadosExcel = dadosFiltrados.map(r => ({
      'ID': r.id_recurso,
      'Nome do Produto': r.nome,
      'Categoria/Tipo': r.tipo || 'N/A',
      'Quantidade Disponível': r.quantidade,
      'Custo Unitário (R$)': r.custo_unitario ? parseFloat(r.custo_unitario) : 0,
      'Custo Total (R$)': r.quantidade * (r.custo_unitario ? parseFloat(r.custo_unitario) : 0)
    }));

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    
    // Configurar largura das colunas
    const colWidths = [
      { wch: 5 }, // ID
      { wch: 30 }, // Nome
      { wch: 15 }, // Tipo
      { wch: 20 }, // Quantidade
      { wch: 20 }, // Custo Unitário
      { wch: 20 }, // Custo Total
    ];
    worksheet['!cols'] = colWidths;

    // Criar workbook e adicionar worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque");

    // Gerar arquivo
    XLSX.writeFile(workbook, "Relatorio_Estoque.xlsx");
    
    setLoading(false);
  };

  const handleExportExcelProjetos = () => {
    setLoadingProjetos(true);

    let dadosFiltrados = [...projetos];

    if (filtroNomeProjeto) {
      dadosFiltrados = dadosFiltrados.filter(p => 
        p.nome_projeto && p.nome_projeto.toLowerCase().includes(filtroNomeProjeto.toLowerCase())
      );
    }

    if (filtroStatusProjeto) {
      dadosFiltrados = dadosFiltrados.filter(p => 
        p.status_projeto && p.status_projeto === filtroStatusProjeto
      );
    }

    if (filtroOrcamentoMin !== '') {
      dadosFiltrados = dadosFiltrados.filter(p => p.orcamento_total >= Number(filtroOrcamentoMin));
    }
    if (filtroOrcamentoMax !== '') {
      dadosFiltrados = dadosFiltrados.filter(p => p.orcamento_total <= Number(filtroOrcamentoMax));
    }

    if (filtroDataInicioMin !== '') {
      dadosFiltrados = dadosFiltrados.filter(p => p.data_inicio && new Date(p.data_inicio) >= new Date(filtroDataInicioMin));
    }
    if (filtroDataInicioMax !== '') {
      // Ajustar data limite para o fim do dia caso apenas a data (YYYY-MM-DD) seja passada
      const dataMax = new Date(filtroDataInicioMax);
      dataMax.setUTCHours(23, 59, 59, 999);
      dadosFiltrados = dadosFiltrados.filter(p => p.data_inicio && new Date(p.data_inicio) <= dataMax);
    }

    // Ordenação
    if (ordenacaoProjeto === 'nome_asc') {
      dadosFiltrados.sort((a, b) => a.nome_projeto.localeCompare(b.nome_projeto));
    } else if (ordenacaoProjeto === 'nome_desc') {
      dadosFiltrados.sort((a, b) => b.nome_projeto.localeCompare(a.nome_projeto));
    } else if (ordenacaoProjeto === 'orcamento_desc') {
      dadosFiltrados.sort((a, b) => b.orcamento_total - a.orcamento_total);
    } else if (ordenacaoProjeto === 'orcamento_asc') {
      dadosFiltrados.sort((a, b) => a.orcamento_total - b.orcamento_total);
    } else if (ordenacaoProjeto === 'data_recente') {
      dadosFiltrados.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));
    }

    if (dadosFiltrados.length === 0) {
      alert("Nenhuma obra encontrada com estes filtros.");
      setLoadingProjetos(false);
      return;
    }

    const dadosExcel = dadosFiltrados.map(p => ({
      'ID': p.id_projeto,
      'Nome da Obra': p.nome_projeto,
      'Status': p.status_projeto || 'Não definido',
      'Data Início': p.data_inicio ? new Date(p.data_inicio).toLocaleDateString('pt-BR') : 'N/A',
      'Data Prevista Fim': p.data_fim ? new Date(p.data_fim).toLocaleDateString('pt-BR') : 'N/A',
      'Orçamento (R$)': p.orcamento_total ? parseFloat(p.orcamento_total) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const colWidths = [
      { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Obras");

    XLSX.writeFile(workbook, "Relatorio_Obras.xlsx");
    setLoadingProjetos(false);
  };

  const handleExportExcelTrabalhadores = () => {
    setLoadingTrabalhadores(true);

    let dadosFiltrados = [...trabalhadores];

    if (filtroNomeTrabalhador) {
      dadosFiltrados = dadosFiltrados.filter(t => 
        t.nome && t.nome.toLowerCase().includes(filtroNomeTrabalhador.toLowerCase())
      );
    }

    if (filtroEspecialidade) {
      dadosFiltrados = dadosFiltrados.filter(t => 
        t.especialidade && t.especialidade.toLowerCase() === filtroEspecialidade.toLowerCase()
      );
    }

    if (filtroRemuneracaoMin !== '') {
      dadosFiltrados = dadosFiltrados.filter(t => t.salario_ou_diaria >= Number(filtroRemuneracaoMin));
    }
    if (filtroRemuneracaoMax !== '') {
      dadosFiltrados = dadosFiltrados.filter(t => t.salario_ou_diaria <= Number(filtroRemuneracaoMax));
    }

    if (filtroTipoPagamento !== '') {
      dadosFiltrados = dadosFiltrados.filter(t => t.tipo_pagamento === filtroTipoPagamento);
    }

    // Ordenação
    if (ordenacaoTrabalhador === 'nome_asc') {
      dadosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (ordenacaoTrabalhador === 'nome_desc') {
      dadosFiltrados.sort((a, b) => b.nome.localeCompare(a.nome));
    } else if (ordenacaoTrabalhador === 'custo_desc') {
      dadosFiltrados.sort((a, b) => b.salario_ou_diaria - a.salario_ou_diaria);
    } else if (ordenacaoTrabalhador === 'custo_asc') {
      dadosFiltrados.sort((a, b) => a.salario_ou_diaria - b.salario_ou_diaria);
    }

    if (dadosFiltrados.length === 0) {
      alert("Nenhum trabalhador encontrado com estes filtros.");
      setLoadingTrabalhadores(false);
      return;
    }

    const dadosExcel = dadosFiltrados.map(t => ({
      'ID': t.id_trabalhador,
      'Nome do Trabalhador': t.nome,
      'Especialidade': t.especialidade || 'Não definida',
      'Telefone': t.telefone || 'N/A',
      'Custo / Pagamento (R$)': t.salario_ou_diaria ? parseFloat(t.salario_ou_diaria) : 0,
      'Tipo de Pagamento': t.tipo_pagamento || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosExcel);
    const colWidths = [
      { wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mão de Obra");

    XLSX.writeFile(workbook, "Relatorio_MaoDeObra.xlsx");
    setLoadingTrabalhadores(false);
  };

  // Extrair tipos únicos para o filtro
  const tiposUnicos = [...new Set(recursos.map(r => r.tipo).filter(Boolean))];
  const statusUnicos = [...new Set(projetos.map(p => p.status_projeto).filter(Boolean))];
  const especialidadesUnicas = [...new Set(trabalhadores.map(t => t.especialidade).filter(Boolean))];
  const tiposPagamentoUnicos = [...new Set(trabalhadores.map(t => t.tipo_pagamento).filter(Boolean))];

  return (
    <section className="card-section form-section" style={{ marginTop: '20px' }}>
      <h2>Relatórios e Extrações</h2>
      <p>Escolha qual módulo deseja exportar para o Excel.</p>

      {/* MENU SUPERIOR DOS RELATÓRIOS */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginTop: '20px', 
        marginBottom: '30px',
        borderBottom: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        paddingBottom: '10px',
        overflowX: 'auto'
      }}>
        <button 
          onClick={() => setRelatorioAtivo('obras')}
          style={{
            background: relatorioAtivo === 'obras' ? '#3b82f6' : 'transparent',
            color: relatorioAtivo === 'obras' ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <DomainIcon fontSize="small" />
          Obras
        </button>

        <button 
          onClick={() => setRelatorioAtivo('estoque')}
          style={{
            background: relatorioAtivo === 'estoque' ? '#10b981' : 'transparent',
            color: relatorioAtivo === 'estoque' ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <InventoryIcon fontSize="small" />
          Estoque
        </button>

        <button 
          onClick={() => setRelatorioAtivo('equipes')}
          style={{
            background: relatorioAtivo === 'equipes' ? '#f59e0b' : 'transparent',
            color: relatorioAtivo === 'equipes' ? '#fff' : (isDarkMode ? '#9ca3af' : '#6b7280'),
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <EngineeringIcon fontSize="small" />
          Mão de Obra
        </button>
      </div>
      
      {/* PAINEL DE ESTOQUE */}
      {relatorioAtivo === 'estoque' && (
      <div style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, background: isDarkMode ? '#1f2937' : '#f9fafb' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <InventoryIcon />
          Relatório de Estoque
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          <div className="form-group" style={{ flex: '1 1 100%', marginBottom: '5px' }}>
            <label>Buscar por Nome</label>
            <input 
              type="text" 
              placeholder="Ex: Cimento" 
              value={filtroNome} 
              onChange={(e) => setFiltroNome(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Filtrar por Categoria</label>
            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Todas as Categorias</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Quantidade Mínima</label>
            <input type="number" placeholder="Ex: 10" min="0" value={filtroQuantidadeMin} onChange={(e) => setFiltroQuantidadeMin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Quantidade Máxima</label>
            <input type="number" placeholder="Ex: 500" min="0" value={filtroQuantidadeMax} onChange={(e) => setFiltroQuantidadeMax(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Custo Mínimo (R$)</label>
            <input type="number" placeholder="Ex: 50.00" min="0" step="0.01" value={filtroCustoMin} onChange={(e) => setFiltroCustoMin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Custo Máximo (R$)</label>
            <input type="number" placeholder="Ex: 1000.00" min="0" step="0.01" value={filtroCustoMax} onChange={(e) => setFiltroCustoMax(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Ordenar Por</label>
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="padrao">Padrão de Cadastro</option>
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="nome_desc">Nome (Z - A)</option>
              <option value="qnt_desc">Maior Quantidade Primeiro</option>
              <option value="qnt_asc">Menor Quantidade Primeiro</option>
              <option value="custo_total_desc">Maior Custo Total Acumulado</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleExportExcel} 
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
          onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
        >
          <FileDownloadIcon />
          {loading ? 'Gerando Planilha...' : 'Baixar Planilha de Estoque (.xlsx)'}
        </button>
      </div>
      )}

      {/* PAINEL DE OBRAS */}
      {relatorioAtivo === 'obras' && (
      <div style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, background: isDarkMode ? '#1f2937' : '#f9fafb' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DomainIcon />
          Relatório de Obras / Projetos
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          <div className="form-group" style={{ flex: '1 1 100%', marginBottom: '5px' }}>
            <label>Buscar por Nome da Obra</label>
            <input 
              type="text" 
              placeholder="Ex: Reforma do Centro" 
              value={filtroNomeProjeto} 
              onChange={(e) => setFiltroNomeProjeto(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Filtrar por Status</label>
            <select value={filtroStatusProjeto} onChange={(e) => setFiltroStatusProjeto(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Todos os Status</option>
              {statusUnicos.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Orçamento Mínimo (R$)</label>
            <input type="number" placeholder="Ex: 10000" min="0" step="100" value={filtroOrcamentoMin} onChange={(e) => setFiltroOrcamentoMin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Orçamento Máximo (R$)</label>
            <input type="number" placeholder="Ex: 500000" min="0" step="100" value={filtroOrcamentoMax} onChange={(e) => setFiltroOrcamentoMax(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Data Início (De)</label>
            <input type="date" value={filtroDataInicioMin} onChange={(e) => setFiltroDataInicioMin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Data Início (Até)</label>
            <input type="date" value={filtroDataInicioMax} onChange={(e) => setFiltroDataInicioMax(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Ordenar Por</label>
            <select value={ordenacaoProjeto} onChange={(e) => setOrdenacaoProjeto(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="padrao">Padrão de Cadastro</option>
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="nome_desc">Nome (Z - A)</option>
              <option value="orcamento_desc">Maior Orçamento Primeiro</option>
              <option value="orcamento_asc">Menor Orçamento Primeiro</option>
              <option value="data_recente">Obras mais recentes</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleExportExcelProjetos} 
          disabled={loadingProjetos}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#3b82f6', // blue for projects to differentiate
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
          onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          <FileDownloadIcon />
          {loadingProjetos ? 'Gerando Planilha...' : 'Baixar Planilha de Obras (.xlsx)'}
        </button>
      </div>
      )}

      {/* PAINEL DE TRABALHADORES E EQUIPES */}
      {relatorioAtivo === 'equipes' && (
      <div style={{ padding: '20px', borderRadius: '8px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, background: isDarkMode ? '#1f2937' : '#f9fafb' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <EngineeringIcon />
          Relatório de Mão de Obra / Equipes
        </h3>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          
          <div className="form-group" style={{ flex: '1 1 100%', marginBottom: '5px' }}>
            <label>Buscar por Nome do Profissional</label>
            <input 
              type="text" 
              placeholder="Ex: Carlos Pedreiro" 
              value={filtroNomeTrabalhador} 
              onChange={(e) => setFiltroNomeTrabalhador(e.target.value)} 
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Filtrar por Especialidade</label>
            <select value={filtroEspecialidade} onChange={(e) => setFiltroEspecialidade(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Todas as Especialidades</option>
              {especialidadesUnicas.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Tipo de Pagamento</label>
            <select value={filtroTipoPagamento} onChange={(e) => setFiltroTipoPagamento(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Qualquer Tipo</option>
              {tiposPagamentoUnicos.map(tp => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Remuneração Min (R$)</label>
            <input type="number" placeholder="Ex: 50" min="0" step="10" value={filtroRemuneracaoMin} onChange={(e) => setFiltroRemuneracaoMin(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Remuneração Max (R$)</label>
            <input type="number" placeholder="Ex: 300" min="0" step="10" value={filtroRemuneracaoMax} onChange={(e) => setFiltroRemuneracaoMax(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }} />
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Ordenar Por</label>
            <select value={ordenacaoTrabalhador} onChange={(e) => setOrdenacaoTrabalhador(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="padrao">Padrão de Cadastro</option>
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="nome_desc">Nome (Z - A)</option>
              <option value="custo_desc">Maior Remuneração Primeiro</option>
              <option value="custo_asc">Menor Remuneração Primeiro</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleExportExcelTrabalhadores} 
          disabled={loadingTrabalhadores}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#f59e0b', // amber/orange for workers to differentiate
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
          onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
        >
          <FileDownloadIcon />
          {loadingTrabalhadores ? 'Gerando Planilha...' : 'Baixar Planilha de Mão de Obra (.xlsx)'}
        </button>
      </div>
      )}

    </section>
  );
}
