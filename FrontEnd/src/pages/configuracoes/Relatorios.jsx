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
  const [filtroQuantidade, setFiltroQuantidade] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCusto, setFiltroCusto] = useState('');
  const [ordenacao, setOrdenacao] = useState('padrao');
  
  // Estados para Projetos
  const [projetos, setProjetos] = useState([]);
  const [filtroNomeProjeto, setFiltroNomeProjeto] = useState('');
  const [filtroStatusProjeto, setFiltroStatusProjeto] = useState('');
  const [filtroOrcamentoProjeto, setFiltroOrcamentoProjeto] = useState('');
  const [ordenacaoProjeto, setOrdenacaoProjeto] = useState('padrao');

  // Estados para Trabalhadores
  const [trabalhadores, setTrabalhadores] = useState([]);
  const [filtroNomeTrabalhador, setFiltroNomeTrabalhador] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [filtroCustoTrabalhador, setFiltroCustoTrabalhador] = useState('');
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

    if (filtroQuantidade === 'baixo') {
      dadosFiltrados = dadosFiltrados.filter(r => r.quantidade < 10);
    } else if (filtroQuantidade === 'alto') {
      dadosFiltrados = dadosFiltrados.filter(r => r.quantidade >= 10);
    } else if (filtroQuantidade === 'zerado') {
      dadosFiltrados = dadosFiltrados.filter(r => r.quantidade === 0);
    }

    if (filtroCusto === 'alto') {
      dadosFiltrados = dadosFiltrados.filter(r => r.custo_unitario >= 500);
    } else if (filtroCusto === 'medio') {
      dadosFiltrados = dadosFiltrados.filter(r => r.custo_unitario >= 100 && r.custo_unitario < 500);
    } else if (filtroCusto === 'baixo') {
      dadosFiltrados = dadosFiltrados.filter(r => r.custo_unitario < 100);
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

    if (filtroOrcamentoProjeto === 'alto') {
      dadosFiltrados = dadosFiltrados.filter(p => p.orcamento_total >= 100000);
    } else if (filtroOrcamentoProjeto === 'medio') {
      dadosFiltrados = dadosFiltrados.filter(p => p.orcamento_total >= 10000 && p.orcamento_total < 100000);
    } else if (filtroOrcamentoProjeto === 'baixo') {
      dadosFiltrados = dadosFiltrados.filter(p => p.orcamento_total < 10000);
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

    if (filtroCustoTrabalhador === 'alto') {
      dadosFiltrados = dadosFiltrados.filter(t => t.salario_ou_diaria >= 300);
    } else if (filtroCustoTrabalhador === 'medio') {
      dadosFiltrados = dadosFiltrados.filter(t => t.salario_ou_diaria >= 100 && t.salario_ou_diaria < 300);
    } else if (filtroCustoTrabalhador === 'baixo') {
      dadosFiltrados = dadosFiltrados.filter(t => t.salario_ou_diaria < 100);
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
            <label>Filtrar por Quantidade</label>
            <select value={filtroQuantidade} onChange={(e) => setFiltroQuantidade(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Qualquer Quantidade</option>
              <option value="baixo">Estoque Baixo (Menor que 10)</option>
              <option value="alto">Estoque Alto (10 ou mais)</option>
              <option value="zerado">Sem Estoque (Zero)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: '1 1 200px' }}>
            <label>Custo Unitário</label>
            <select value={filtroCusto} onChange={(e) => setFiltroCusto(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Qualquer Valor</option>
              <option value="baixo">Baixo Custo (Abaixo de R$ 100)</option>
              <option value="medio">Custo Médio (R$ 100 até R$ 500)</option>
              <option value="alto">Alto Custo (Acima de R$ 500)</option>
            </select>
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
            <label>Faixa de Orçamento</label>
            <select value={filtroOrcamentoProjeto} onChange={(e) => setFiltroOrcamentoProjeto(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Qualquer Valor</option>
              <option value="baixo">Abaixo de R$ 10.000</option>
              <option value="medio">Entre R$ 10.000 e R$ 100.000</option>
              <option value="alto">Acima de R$ 100.000</option>
            </select>
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
            <label>Faixa de Remuneração/Custo</label>
            <select value={filtroCustoTrabalhador} onChange={(e) => setFiltroCustoTrabalhador(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#f9fafb' : '#111827' }}>
              <option value="">Qualquer Valor</option>
              <option value="baixo">Menos de R$ 100 (Diária Baixa)</option>
              <option value="medio">R$ 100 até R$ 300 (Diária Média)</option>
              <option value="alto">Acima de R$ 300 (Especialista/Mensal)</option>
            </select>
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
