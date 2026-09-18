import React, { useState, useEffect, useMemo } from "react";
import { parseLocalDate, formatDateBR } from "../../utils/dateUtils";
import * as XLSX from "xlsx";
import { useTheme } from "../../contexts/ThemeContext";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InventoryIcon from "@mui/icons-material/Inventory";
import DomainIcon from "@mui/icons-material/Domain";
import EngineeringIcon from "@mui/icons-material/Engineering";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

/* Sub-componente: Lista de Checkboxes com busca interna */
function CheckboxList({ items, selectedIds, onToggle, onSelectAll, onClearAll,
                        labelKey, idKey, isDarkMode, accentColor }) {
  const [busca, setBusca] = useState("");
  const itensFiltrados = useMemo(() =>
    items.filter(it => String(it[labelKey] || "").toLowerCase().includes(busca.toLowerCase())),
    [items, busca, labelKey]
  );
  const col = { border: "none", outline: "none", background: "transparent",
                color: isDarkMode ? "#f9fafb" : "#111827", fontSize: "0.85rem", width: "100%" };
  return (
    <div style={{ border: `1px solid ${isDarkMode ? "#4b5563" : "#e5e7eb"}`, borderRadius: "8px", overflow: "hidden" }}>
      {/* Barra de busca + acoes */}
      <div style={{ padding: "10px 12px", background: isDarkMode ? "#111827" : "#f3f4f6",
                    borderBottom: `1px solid ${isDarkMode ? "#4b5563" : "#e5e7eb"}`,
                    display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: "6px",
                      background: isDarkMode ? "#374151" : "#fff",
                      border: `1px solid ${isDarkMode ? "#4b5563" : "#d1d5db"}`,
                      borderRadius: "6px", padding: "6px 10px" }}>
          <SearchIcon style={{ fontSize: "1rem", color: isDarkMode ? "#9ca3af" : "#6b7280", flexShrink: 0 }} />
          <input type="text" placeholder="Buscar..." value={busca}
                 onChange={e => setBusca(e.target.value)} style={col} />
        </div>
        <button onClick={onSelectAll}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem",
                   color: accentColor, fontWeight: "600", padding: "4px 8px", borderRadius: "4px" }}>
          Todos
        </button>
        <button onClick={onClearAll}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem",
                   color: isDarkMode ? "#9ca3af" : "#6b7280", fontWeight: "600", padding: "4px 8px", borderRadius: "4px" }}>
          Limpar
        </button>
        <span style={{ fontSize: "0.78rem", color: isDarkMode ? "#9ca3af" : "#6b7280", marginLeft: "auto" }}>
          {selectedIds.length === 0 ? "Todos (Relatorio Geral)" : `${selectedIds.length} selecionado${selectedIds.length > 1 ? "s" : ""}`}
        </span>
      </div>
      {/* Lista */}
      <div style={{ maxHeight: "220px", overflowY: "auto", padding: "8px 0" }}>
        {itensFiltrados.length === 0 ? (
          <p style={{ textAlign: "center", color: isDarkMode ? "#6b7280" : "#9ca3af", fontSize: "0.85rem", padding: "16px" }}>
            Nenhum item encontrado.
          </p>
        ) : itensFiltrados.map(item => {
          const id = item[idKey];
          const sel = selectedIds.includes(id);
          return (
            <label key={id}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "7px 14px",
                       cursor: "pointer",
                       background: sel ? (isDarkMode ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.07)") : "transparent",
                       transition: "background 0.15s" }}>
              <input type="checkbox" checked={sel} onChange={() => onToggle(id)} style={{ display: "none" }} />
              {sel
                ? <CheckBoxIcon style={{ fontSize: "1.2rem", color: accentColor, flexShrink: 0 }} />
                : <CheckBoxOutlineBlankIcon style={{ fontSize: "1.2rem", color: isDarkMode ? "#6b7280" : "#9ca3af", flexShrink: 0 }} />}
              <span style={{ fontSize: "0.875rem", color: isDarkMode ? "#f3f4f6" : "#111827",
                             overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item[labelKey]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* Componente principal */
export default function Relatorios({ token }) {
  const { isDarkMode } = useTheme();

  const [recursos, setRecursos]               = useState([]);
  const [projetos, setProjetos]               = useState([]);
  const [trabalhadores, setTrabalhadores]     = useState([]);

  /* Selecao por checkbox */
  const [projetosSelecionados,       setProjetosSelecionados]       = useState([]);
  const [recursosSelecionados,       setRecursosSelecionados]       = useState([]);
  const [trabalhadoresSelecionados,  setTrabalhadoresSelecionados]  = useState([]);

  /* Filtros auxiliares Estoque */
  const [filtroTipo,          setFiltroTipo]          = useState("");
  const [filtroQuantidadeMin, setFiltroQuantidadeMin] = useState("");
  const [filtroQuantidadeMax, setFiltroQuantidadeMax] = useState("");
  const [filtroCustoMin,      setFiltroCustoMin]      = useState("");
  const [filtroCustoMax,      setFiltroCustoMax]      = useState("");
  const [ordenacao,           setOrdenacao]           = useState("padrao");

  /* Filtros auxiliares Obras */
  const [filtroStatusProjeto, setFiltroStatusProjeto] = useState("");
  const [filtroOrcamentoMin,  setFiltroOrcamentoMin]  = useState("");
  const [filtroOrcamentoMax,  setFiltroOrcamentoMax]  = useState("");
  const [filtroDataInicioMin, setFiltroDataInicioMin] = useState("");
  const [filtroDataInicioMax, setFiltroDataInicioMax] = useState("");
  const [ordenacaoProjeto,    setOrdenacaoProjeto]    = useState("padrao");

  /* Filtros auxiliares Mao de Obra */
  const [filtroEspecialidade,  setFiltroEspecialidade]  = useState("");
  const [filtroRemuneracaoMin, setFiltroRemuneracaoMin] = useState("");
  const [filtroRemuneracaoMax, setFiltroRemuneracaoMax] = useState("");
  const [filtroTipoPagamento,  setFiltroTipoPagamento]  = useState("");
  const [ordenacaoTrabalhador, setOrdenacaoTrabalhador] = useState("padrao");

  const [relatorioAtivo,        setRelatorioAtivo]        = useState("obras");
  const [loading,               setLoading]               = useState(false);
  const [loadingProjetos,       setLoadingProjetos]       = useState(false);
  const [loadingTrabalhadores,  setLoadingTrabalhadores]  = useState(false);

  useEffect(() => {
    fetchRecursos(); fetchProjetos(); fetchTrabalhadores();
  }, [token]);

  const fetchProjetos = async () => {
    try { const r = await fetch("http://localhost:3000/api/projetos", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) setProjetos(await r.json()); } catch(e) { console.error(e); }
  };
  const fetchRecursos = async () => {
    try { const r = await fetch("http://localhost:3000/api/recursos", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) setRecursos(await r.json()); } catch(e) { console.error(e); }
  };
  const fetchTrabalhadores = async () => {
    try { const r = await fetch("http://localhost:3000/api/trabalhadores", { headers: { Authorization: `Bearer ${token}` } });
          if (r.ok) setTrabalhadores(await r.json()); } catch(e) { console.error(e); }
  };

  /* helpers */
  const toggle = setter => id => setter(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = (items, idKey, setter) => setter(items.map(i => i[idKey]));
  const clearAll  = setter => setter([]);

  const tiposUnicos          = useMemo(() => [...new Set(recursos.map(r => r.tipo).filter(Boolean))], [recursos]);
  const statusUnicos         = useMemo(() => [...new Set(projetos.map(p => p.status_projeto).filter(Boolean))], [projetos]);
  const especialidadesUnicas = useMemo(() => [...new Set(trabalhadores.map(t => t.especialidade).filter(Boolean))], [trabalhadores]);
  const tiposPagamentoUnicos = useMemo(() => [...new Set(trabalhadores.map(t => t.tipo_pagamento).filter(Boolean))], [trabalhadores]);

  /* EXPORT ESTOQUE
     Regra: ids vazios -> relatorio geral; senao filtra por id */
  const handleExportExcel = () => {
    setLoading(true);
    let dados = recursosSelecionados.length === 0
      ? [...recursos]
      : recursos.filter(r => recursosSelecionados.includes(r.id_recurso));

    if (filtroTipo)              dados = dados.filter(r => r.tipo && r.tipo.toLowerCase() === filtroTipo.toLowerCase());
    if (filtroQuantidadeMin !== "") dados = dados.filter(r => r.quantidade >= Number(filtroQuantidadeMin));
    if (filtroQuantidadeMax !== "") dados = dados.filter(r => r.quantidade <= Number(filtroQuantidadeMax));
    if (filtroCustoMin !== "")   dados = dados.filter(r => r.custo_unitario >= Number(filtroCustoMin));
    if (filtroCustoMax !== "")   dados = dados.filter(r => r.custo_unitario <= Number(filtroCustoMax));

    if (ordenacao === "nome_asc")         dados.sort((a,b) => a.nome.localeCompare(b.nome));
    else if (ordenacao === "nome_desc")   dados.sort((a,b) => b.nome.localeCompare(a.nome));
    else if (ordenacao === "qnt_asc")     dados.sort((a,b) => a.quantidade - b.quantidade);
    else if (ordenacao === "qnt_desc")    dados.sort((a,b) => b.quantidade - a.quantidade);
    else if (ordenacao === "custo_total_desc") dados.sort((a,b) => (b.quantidade*b.custo_unitario)-(a.quantidade*a.custo_unitario));

    if (dados.length === 0) { alert("Nenhum item encontrado com estes filtros."); setLoading(false); return; }

    const ws = XLSX.utils.json_to_sheet(dados.map(r => ({
      "ID": r.id_recurso, "Nome do Produto": r.nome, "Categoria/Tipo": r.tipo||"N/A",
      "Quantidade": r.quantidade, "Custo Unitario (R$)": r.custo_unitario ? parseFloat(r.custo_unitario) : 0,
      "Custo Total (R$)": r.quantidade*(r.custo_unitario ? parseFloat(r.custo_unitario) : 0)
    })));
    ws["!cols"] = [{wch:5},{wch:30},{wch:15},{wch:15},{wch:20},{wch:20}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Estoque");
    XLSX.writeFile(wb, `Relatorio_Estoque${recursosSelecionados.length > 0 ? "_Filtrado" : "_Geral"}.xlsx`);
    setLoading(false);
  };

  /* EXPORT OBRAS */
  const handleExportExcelProjetos = () => {
    setLoadingProjetos(true);
    let dados = projetosSelecionados.length === 0
      ? [...projetos]
      : projetos.filter(p => projetosSelecionados.includes(p.id_projeto));

    if (filtroStatusProjeto) dados = dados.filter(p => p.status_projeto === filtroStatusProjeto);
    if (filtroOrcamentoMin !== "") dados = dados.filter(p => p.orcamento_total >= Number(filtroOrcamentoMin));
    if (filtroOrcamentoMax !== "") dados = dados.filter(p => p.orcamento_total <= Number(filtroOrcamentoMax));
    if (filtroDataInicioMin !== "") dados = dados.filter(p => p.data_inicio && parseLocalDate(p.data_inicio) >= parseLocalDate(filtroDataInicioMin));
    if (filtroDataInicioMax !== "") {
      const dm = parseLocalDate(filtroDataInicioMax); dm.setHours(23,59,59,999);
      dados = dados.filter(p => p.data_inicio && parseLocalDate(p.data_inicio) <= dm);
    }
    if (ordenacaoProjeto === "nome_asc")         dados.sort((a,b) => a.nome_projeto.localeCompare(b.nome_projeto));
    else if (ordenacaoProjeto === "nome_desc")   dados.sort((a,b) => b.nome_projeto.localeCompare(a.nome_projeto));
    else if (ordenacaoProjeto === "orcamento_desc") dados.sort((a,b) => b.orcamento_total-a.orcamento_total);
    else if (ordenacaoProjeto === "orcamento_asc")  dados.sort((a,b) => a.orcamento_total-b.orcamento_total);
    else if (ordenacaoProjeto === "data_recente")   dados.sort((a,b) => parseLocalDate(b.data_inicio)-parseLocalDate(a.data_inicio));

    if (dados.length === 0) { alert("Nenhuma obra encontrada com estes filtros."); setLoadingProjetos(false); return; }

    const ws = XLSX.utils.json_to_sheet(dados.map(p => ({
      "ID": p.id_projeto, "Nome da Obra": p.nome_projeto, "Status": p.status_projeto||"Nao definido",
      "Data Inicio": formatDateBR(p.data_inicio), "Data Prevista Fim": formatDateBR(p.data_fim),
      "Orcamento (R$)": p.orcamento_total ? parseFloat(p.orcamento_total) : 0
    })));
    ws["!cols"] = [{wch:5},{wch:30},{wch:15},{wch:15},{wch:15},{wch:20}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Obras");
    XLSX.writeFile(wb, `Relatorio_Obras${projetosSelecionados.length > 0 ? "_Filtrado" : "_Geral"}.xlsx`);
    setLoadingProjetos(false);
  };

  /* EXPORT MAO DE OBRA */
  const handleExportExcelTrabalhadores = () => {
    setLoadingTrabalhadores(true);
    let dados = trabalhadoresSelecionados.length === 0
      ? [...trabalhadores]
      : trabalhadores.filter(t => trabalhadoresSelecionados.includes(t.id_trabalhador));

    if (filtroEspecialidade) dados = dados.filter(t => t.especialidade && t.especialidade.toLowerCase() === filtroEspecialidade.toLowerCase());
    if (filtroTipoPagamento) dados = dados.filter(t => t.tipo_pagamento === filtroTipoPagamento);
    if (filtroRemuneracaoMin !== "") dados = dados.filter(t => t.custo_diario >= Number(filtroRemuneracaoMin));
    if (filtroRemuneracaoMax !== "") dados = dados.filter(t => t.custo_diario <= Number(filtroRemuneracaoMax));

    if (ordenacaoTrabalhador === "nome_asc")        dados.sort((a,b) => a.nome_trabalhador.localeCompare(b.nome_trabalhador));
    else if (ordenacaoTrabalhador === "nome_desc")  dados.sort((a,b) => b.nome_trabalhador.localeCompare(a.nome_trabalhador));
    else if (ordenacaoTrabalhador === "custo_desc") dados.sort((a,b) => b.custo_diario-a.custo_diario);
    else if (ordenacaoTrabalhador === "custo_asc")  dados.sort((a,b) => a.custo_diario-b.custo_diario);

    if (dados.length === 0) { alert("Nenhum profissional encontrado com estes filtros."); setLoadingTrabalhadores(false); return; }

    const ws = XLSX.utils.json_to_sheet(dados.map(t => ({
      "ID": t.id_trabalhador, "Nome do Profissional": t.nome_trabalhador,
      "Tipo de Vinculo": t.tipo_vinculo||"N/A", "Custo Diario (R$)": t.custo_diario ? parseFloat(t.custo_diario) : 0
    })));
    ws["!cols"] = [{wch:5},{wch:30},{wch:20},{wch:20}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Mao de Obra");
    XLSX.writeFile(wb, `Relatorio_MaoDeObra${trabalhadoresSelecionados.length > 0 ? "_Filtrado" : "_Geral"}.xlsx`);
    setLoadingTrabalhadores(false);
  };

  /* Estilos */
  const panelStyle = { padding:"24px", borderRadius:"10px",
    border:`1px solid ${isDarkMode?"#374151":"#e5e7eb"}`, background:isDarkMode?"#1f2937":"#f9fafb" };
  const selStyle = { width:"100%", boxSizing:"border-box", padding:"10px", borderRadius:"6px",
    border:`1px solid ${isDarkMode?"#4b5563":"#d1d5db"}`, background:isDarkMode?"#374151":"#fff",
    color:isDarkMode?"#f9fafb":"#111827" };
  const inpStyle = { ...selStyle };

  const TabBtn = ({ id, label, icon, color }) => (
    <button onClick={() => setRelatorioAtivo(id)} style={{
      background: relatorioAtivo===id ? color : "transparent",
      color: relatorioAtivo===id ? "#fff" : (isDarkMode?"#9ca3af":"#6b7280"),
      border:`2px solid ${relatorioAtivo===id ? color : "transparent"}`,
      padding:"10px 20px", borderRadius:"8px", cursor:"pointer",
      fontWeight:"600", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.2s"
    }}>
      {icon}{label}
    </button>
  );

  const ExportBtn = ({ onClick, isLoading, label, color }) => (
    <button onClick={onClick} disabled={isLoading} style={{
      display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
      background: isLoading ? (isDarkMode?"#374151":"#e5e7eb") : color,
      color: isLoading ? (isDarkMode?"#9ca3af":"#6b7280") : "white",
      border:"none", padding:"13px 24px", borderRadius:"8px",
      cursor: isLoading ? "not-allowed" : "pointer",
      fontWeight:"700", width:"100%", fontSize:"0.95rem", transition:"background 0.2s", marginTop:"4px"
    }}>
      <FileDownloadIcon />
      {isLoading ? "Gerando Planilha..." : label}
    </button>
  );

  const InfoTag = ({ count, total, color }) => (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:"6px",
      background: count===0 ? (isDarkMode?"rgba(16,185,129,0.15)":"#d1fae5") : (isDarkMode?"rgba(59,130,246,0.15)":"#dbeafe"),
      border:`1px solid ${count===0?"#6ee7b7":"#93c5fd"}`,
      color: count===0 ? "#059669" : color,
      borderRadius:"20px", padding:"4px 12px", fontSize:"0.8rem", fontWeight:"700", marginBottom:"12px"
    }}>
      {count===0
        ? `Relatorio Geral (${total} itens)`
        : `${count} de ${total} selecionado${count>1?"s":""}`}
    </div>
  );

  return (
    <section className="card-section form-section" style={{ marginTop:"20px" }}>
      <h2>Relatorios e Extracoes</h2>
      <p style={{ color:isDarkMode?"#9ca3af":"#6b7280" }}>
        Selecione os itens — sem selecao exporta <strong>todos</strong> (Relatorio Geral).
      </p>

      {/* Abas */}
      <div style={{ display:"flex", gap:"10px", marginTop:"20px", marginBottom:"28px",
                    borderBottom:`2px solid ${isDarkMode?"#374151":"#e5e7eb"}`,
                    paddingBottom:"12px", overflowX:"auto" }}>
        <TabBtn id="obras"   label="Obras"       icon={<DomainIcon fontSize="small"/>}      color="#3b82f6" />
        <TabBtn id="estoque" label="Estoque"     icon={<InventoryIcon fontSize="small"/>}   color="#10b981" />
        <TabBtn id="equipes" label="Mao de Obra" icon={<EngineeringIcon fontSize="small"/>} color="#f59e0b" />
      </div>

      {/* ---- PAINEL OBRAS ---- */}
      {relatorioAtivo === "obras" && (
        <div style={panelStyle}>
          <h3 style={{ marginTop:0, marginBottom:"6px", display:"flex", alignItems:"center", gap:"10px" }}>
            <DomainIcon /> Relatorio de Obras / Projetos
          </h3>
          <InfoTag count={projetosSelecionados.length} total={projetos.length} color="#3b82f6" />
          <div className="form-group" style={{ marginBottom:"18px" }}>
            <label style={{ fontWeight:"600", display:"block", marginBottom:"8px" }}>Selecionar Obras</label>
            <CheckboxList items={projetos} selectedIds={projetosSelecionados}
              onToggle={toggle(setProjetosSelecionados)}
              onSelectAll={() => selectAll(projetos,"id_projeto",setProjetosSelecionados)}
              onClearAll={() => clearAll(setProjetosSelecionados)}
              labelKey="nome_projeto" idKey="id_projeto" isDarkMode={isDarkMode} accentColor="#3b82f6" />
          </div>
          <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", marginBottom:"18px" }}>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Status</label>
              <select value={filtroStatusProjeto} onChange={e=>setFiltroStatusProjeto(e.target.value)} style={selStyle}>
                <option value="">Todos</option>
                {statusUnicos.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex:"1 1 140px" }}>
              <label>Orcamento Min (R$)</label>
              <input type="number" placeholder="Ex: 10000" min="0" value={filtroOrcamentoMin} onChange={e=>setFiltroOrcamentoMin(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 140px" }}>
              <label>Orcamento Max (R$)</label>
              <input type="number" placeholder="Ex: 500000" min="0" value={filtroOrcamentoMax} onChange={e=>setFiltroOrcamentoMax(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 140px" }}>
              <label>Data Inicio (De)</label>
              <input type="date" value={filtroDataInicioMin} onChange={e=>setFiltroDataInicioMin(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 140px" }}>
              <label>Data Inicio (Ate)</label>
              <input type="date" value={filtroDataInicioMax} onChange={e=>setFiltroDataInicioMax(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Ordenar Por</label>
              <select value={ordenacaoProjeto} onChange={e=>setOrdenacaoProjeto(e.target.value)} style={selStyle}>
                <option value="padrao">Padrao</option>
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="orcamento_desc">Maior Orcamento</option>
                <option value="orcamento_asc">Menor Orcamento</option>
                <option value="data_recente">Mais Recentes</option>
              </select>
            </div>
          </div>
          <ExportBtn onClick={handleExportExcelProjetos} isLoading={loadingProjetos} color="#3b82f6"
            label={projetosSelecionados.length===0
              ? "Baixar Planilha Geral de Obras (.xlsx)"
              : `Baixar Planilha (${projetosSelecionados.length} obra${projetosSelecionados.length>1?"s":""}) (.xlsx)`} />
        </div>
      )}

      {/* ---- PAINEL ESTOQUE ---- */}
      {relatorioAtivo === "estoque" && (
        <div style={panelStyle}>
          <h3 style={{ marginTop:0, marginBottom:"6px", display:"flex", alignItems:"center", gap:"10px" }}>
            <InventoryIcon /> Relatorio de Estoque
          </h3>
          <InfoTag count={recursosSelecionados.length} total={recursos.length} color="#10b981" />
          <div className="form-group" style={{ marginBottom:"18px" }}>
            <label style={{ fontWeight:"600", display:"block", marginBottom:"8px" }}>Selecionar Itens do Estoque</label>
            <CheckboxList items={recursos} selectedIds={recursosSelecionados}
              onToggle={toggle(setRecursosSelecionados)}
              onSelectAll={() => selectAll(recursos,"id_recurso",setRecursosSelecionados)}
              onClearAll={() => clearAll(setRecursosSelecionados)}
              labelKey="nome" idKey="id_recurso" isDarkMode={isDarkMode} accentColor="#10b981" />
          </div>
          <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", marginBottom:"18px" }}>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Categoria</label>
              <select value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)} style={selStyle}>
                <option value="">Todas</option>
                {tiposUnicos.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex:"1 1 120px" }}>
              <label>Qtd Min</label>
              <input type="number" placeholder="Ex: 10" min="0" value={filtroQuantidadeMin} onChange={e=>setFiltroQuantidadeMin(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 120px" }}>
              <label>Qtd Max</label>
              <input type="number" placeholder="Ex: 500" min="0" value={filtroQuantidadeMax} onChange={e=>setFiltroQuantidadeMax(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 120px" }}>
              <label>Custo Min (R$)</label>
              <input type="number" placeholder="Ex: 50" min="0" step="0.01" value={filtroCustoMin} onChange={e=>setFiltroCustoMin(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 120px" }}>
              <label>Custo Max (R$)</label>
              <input type="number" placeholder="Ex: 1000" min="0" step="0.01" value={filtroCustoMax} onChange={e=>setFiltroCustoMax(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Ordenar Por</label>
              <select value={ordenacao} onChange={e=>setOrdenacao(e.target.value)} style={selStyle}>
                <option value="padrao">Padrao</option>
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="qnt_desc">Maior Quantidade</option>
                <option value="qnt_asc">Menor Quantidade</option>
                <option value="custo_total_desc">Maior Custo Total</option>
              </select>
            </div>
          </div>
          <ExportBtn onClick={handleExportExcel} isLoading={loading} color="#10b981"
            label={recursosSelecionados.length===0
              ? "Baixar Planilha Geral de Estoque (.xlsx)"
              : `Baixar Planilha (${recursosSelecionados.length} item${recursosSelecionados.length>1?"s":""}) (.xlsx)`} />
        </div>
      )}

      {/* ---- PAINEL MAO DE OBRA ---- */}
      {relatorioAtivo === "equipes" && (
        <div style={panelStyle}>
          <h3 style={{ marginTop:0, marginBottom:"6px", display:"flex", alignItems:"center", gap:"10px" }}>
            <EngineeringIcon /> Relatorio de Mao de Obra
          </h3>
          <InfoTag count={trabalhadoresSelecionados.length} total={trabalhadores.length} color="#f59e0b" />
          <div className="form-group" style={{ marginBottom:"18px" }}>
            <label style={{ fontWeight:"600", display:"block", marginBottom:"8px" }}>Selecionar Profissionais</label>
            <CheckboxList items={trabalhadores} selectedIds={trabalhadoresSelecionados}
              onToggle={toggle(setTrabalhadoresSelecionados)}
              onSelectAll={() => selectAll(trabalhadores,"id_trabalhador",setTrabalhadoresSelecionados)}
              onClearAll={() => clearAll(setTrabalhadoresSelecionados)}
              labelKey="nome_trabalhador" idKey="id_trabalhador" isDarkMode={isDarkMode} accentColor="#f59e0b" />
          </div>
          <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", marginBottom:"18px" }}>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Especialidade</label>
              <select value={filtroEspecialidade} onChange={e=>setFiltroEspecialidade(e.target.value)} style={selStyle}>
                <option value="">Todas</option>
                {especialidadesUnicas.map(e=><option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Tipo de Vinculo</label>
              <select value={filtroTipoPagamento} onChange={e=>setFiltroTipoPagamento(e.target.value)} style={selStyle}>
                <option value="">Qualquer</option>
                {tiposPagamentoUnicos.map(tp=><option key={tp} value={tp}>{tp}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex:"1 1 130px" }}>
              <label>Custo Diario Min</label>
              <input type="number" placeholder="Ex: 50" min="0" step="10" value={filtroRemuneracaoMin} onChange={e=>setFiltroRemuneracaoMin(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 130px" }}>
              <label>Custo Diario Max</label>
              <input type="number" placeholder="Ex: 300" min="0" step="10" value={filtroRemuneracaoMax} onChange={e=>setFiltroRemuneracaoMax(e.target.value)} style={inpStyle} />
            </div>
            <div className="form-group" style={{ flex:"1 1 180px" }}>
              <label>Ordenar Por</label>
              <select value={ordenacaoTrabalhador} onChange={e=>setOrdenacaoTrabalhador(e.target.value)} style={selStyle}>
                <option value="padrao">Padrao</option>
                <option value="nome_asc">Nome (A-Z)</option>
                <option value="nome_desc">Nome (Z-A)</option>
                <option value="custo_desc">Maior Custo Diario</option>
                <option value="custo_asc">Menor Custo Diario</option>
              </select>
            </div>
          </div>
          <ExportBtn onClick={handleExportExcelTrabalhadores} isLoading={loadingTrabalhadores} color="#f59e0b"
            label={trabalhadoresSelecionados.length===0
              ? "Baixar Planilha Geral de Mao de Obra (.xlsx)"
              : `Baixar Planilha (${trabalhadoresSelecionados.length} profissional${trabalhadoresSelecionados.length>1?"is":""}) (.xlsx)`} />
        </div>
      )}
    </section>
  );
}
