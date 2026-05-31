import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import exerciseCatalog, {
  getExercisesByGroup,
  searchExercises,
  getExerciseById,
} from "../data/exerciseCatalog";

/* ── Ícones SVG ── */
function IcEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function IcTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function IcSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IcPlay() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  );
}

/* ── Helper: YouTube → embed ── */
function converterVideoUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  if (url.includes("youtube.com/embed/")) return url;
  return url;
}

/* ── Cores dos grupos musculares ── */
const groupColors = {
  Peito: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  Costas: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  Ombros: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  Bíceps: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  Tríceps: { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  Pernas: { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  Posterior: { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  Core: { bg: "#e0f2fe", text: "#075985", border: "#7dd3fc" },
};

function getGroupStyle(grupo) {
  return groupColors[grupo] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
}

/* ════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ════════════════════════════════════════════════════════════════════ */
function CrudTreino() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idTreinoEdicao, setIdTreinoEdicao] = useState(null);
  const [idTreinoDeletar, setIdTreinoDeletar] = useState(null);
  const [treinoDetalhado, setTreinoDetalhado] = useState(null);

  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaDuracao, setNovaDuracao] = useState("");
  const [exerciciosForm, setExerciciosForm] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Seleção de exercício do catálogo
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [exSeries, setExSeries] = useState("");
  const [exReps, setExReps] = useState("");
  const [exCarga, setExCarga] = useState("");
  const [exObs, setExObs] = useState("");

  // Mídia expandida na visualização detalhada
  const [exMediaAberto, setExMediaAberto] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function fetchTreinos() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get("/v1/treinos", {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        });

        if (response.operacaoFinalizada === false) {
          throw new Error(
            response.mensagem?.detalhe || "Falha ao buscar treinos.",
          );
        }

        const dadosOriginais = response.data?.result || response.data || [];
        const treinosNormalizados = dadosOriginais.map((t) => ({
          ...t,
          id: t._id || t.id,
        }));

        setLista(treinosNormalizados || []);
      } catch (err) {
        console.error("Erro ao buscar treinos:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchTreinos();
  }, []);

  const listaFiltrada = (lista || []).filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  /* ── Exercícios do formulário ── */
  function handleSelecionarExercicio(exCatalog) {
    setShowExercisePicker(false);
    setExerciseSearch("");
    // Abre mini-form pra configurar séries/reps
    const novoEx = {
      id: "ex_" + Date.now(),
      catalogId: exCatalog.id,
      nome: exCatalog.nome,
      grupo: exCatalog.grupo,
      imagemUrl: exCatalog.imagem,
      videoUrl: exCatalog.video || null,
      series: 3,
      repeticoes: 12,
      carga: 0,
      observacao: "",
    };
    setExerciciosForm([...exerciciosForm, novoEx]);
  }

  function handleRemoverExercicioNoForm(idEx) {
    setExerciciosForm(exerciciosForm.filter((ex) => ex.id !== idEx));
  }

  function handleAtualizarExercicioNoForm(idEx, campo, valor) {
    setExerciciosForm((prev) =>
      prev.map((ex) => (ex.id === idEx ? { ...ex, [campo]: valor } : ex)),
    );
  }

  function abrirCriacao() {
    setIdTreinoEdicao(null);
    setNovoNome("");
    setNovaDescricao("");
    setNovaDuracao("");
    setExerciciosForm([]);
    setIsModalOpen(true);
  }

  function abrirEdicao(treino) {
    setIdTreinoEdicao(treino.id);
    setNovoNome(treino.nome);
    setNovaDescricao(treino.descricao || "");
    setNovaDuracao(treino.duracaoMinutos || "");
    setExerciciosForm(
      (treino.exercicios || []).map((ex) => ({
        ...ex,
        id: ex._id || ex.id || "ex_" + Date.now() + Math.random(),
      })),
    );
    setIsModalOpen(true);
  }

  async function handleSalvarTreino(e) {
    e.preventDefault();
    if (!novoNome || !novaDuracao) return;

    const formatoExercicios = exerciciosForm.map((ex) => ({
      nome: ex.nome,
      series: Number(ex.series),
      repeticoes: Number(ex.repeticoes),
      carga: Number(ex.carga) || 0,
      observacao: ex.observacao || "",
      imagemUrl: ex.imagemUrl || null,
      videoUrl: ex.videoUrl || null,
    }));

    try {
      const url = idTreinoEdicao
        ? `/v1/treinos/${idTreinoEdicao}`
        : "/v1/treinos";
      const method = idTreinoEdicao ? "PUT" : "POST";

      let response = {};
      const payload = {
        nome: novoNome,
        descricao: novaDescricao,
        duracaoMinutos: Number(novaDuracao),
        exercicios: formatoExercicios,
      };

      if (method === "PUT") {
        response = await api.put(url, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          ...payload,
        });
      } else {
        response = await api.post(url, {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          ...payload,
        });
      }

      if (response.operacaoFinalizada === false) {
        throw new Error(
          response.mensagem?.detalhe ||
            response.mensagem?.msg ||
            "Falha ao salvar treino.",
        );
      }

      const data = response.data || response;
      const resultado = data.result || data;
      const treinoSalvo = {
        ...resultado,
        id: resultado._id || resultado.id,
        dia: resultado.dia || "A definir",
        ultima: resultado.ultima || "Nunca realizado",
      };

      if (idTreinoEdicao) {
        setLista((prev) =>
          prev.map((t) => (t.id === idTreinoEdicao ? treinoSalvo : t)),
        );
        if (treinoDetalhado && treinoDetalhado.id === idTreinoEdicao) {
          setTreinoDetalhado(treinoSalvo);
        }
      } else {
        setLista((prev) => [...prev, treinoSalvo]);
      }

      setIsModalOpen(false);
      setIdTreinoEdicao(null);
      setNovoNome("");
      setNovaDescricao("");
      setNovaDuracao("");
      setExerciciosForm([]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao salvar o treino. Verifique seus dados.");
    }
  }

  async function handleConfirmarDeletar() {
    try {
      const response = await api.delete(`/v1/treinos/${idTreinoDeletar}`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      if (response.operacaoFinalizada === false) {
        throw new Error(
          response.mensagem?.detalhe ||
            response.mensagem?.msg ||
            "Falha ao excluir treino.",
        );
      }
      setLista((prev) => prev.filter((t) => t.id !== idTreinoDeletar));
      if (treinoDetalhado && treinoDetalhado.id === idTreinoDeletar) {
        setTreinoDetalhado(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao excluir o treino.");
    } finally {
      setIdTreinoDeletar(null);
    }
  }

  // Corrigido para readAsDataURL
  function handleUploadFoto(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const treinoAtualizado = { ...treinoDetalhado, foto: reader.result };
        setTreinoDetalhado(treinoAtualizado);
        setLista((prev) =>
          prev.map((t) =>
            t.id === treinoDetalhado.id ? treinoAtualizado : t,
          ),
        );
      };
      reader.readAsDataURL(file);
    }
  }

  function handleExcluirFoto() {
    const comboSemFoto = { ...treinoDetalhado, foto: null };
    setTreinoDetalhado(comboSemFoto);
    setLista((prev) =>
      prev.map((t) => (t.id === treinoDetalhado.id ? comboSemFoto : t)),
    );
  }

  /* ── Exercícios filtrados do catálogo ── */
  const exerciciosFiltrados = searchExercises(exerciseSearch);
  const gruposAgrupados = {};
  for (const ex of exerciciosFiltrados) {
    if (!gruposAgrupados[ex.grupo]) gruposAgrupados[ex.grupo] = [];
    gruposAgrupados[ex.grupo].push(ex);
  }

  /* ════════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════════ */
  return (
    <div
      className="crud-content"
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      {!treinoDetalhado ? (
        <>
          {/* ── LISTA DE TREINOS ── */}
          <div
            className="crud-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <h1 className="crud-titulo" style={{ margin: 0, whiteSpace: "nowrap" }}>
              Lista de Treinos
            </h1>
            <div className="crud-search-wrap" style={{ flex: 1, maxWidth: "500px" }}>
              <span className="crud-search-icon"><IcSearch /></span>
              <input
                type="text"
                className="crud-search"
                placeholder="Pesquisar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Pesquisar treinos"
                style={{ width: "100%" }}
              />
            </div>
            <button className="crud-criar-btn" onClick={abrirCriacao} style={{ whiteSpace: "nowrap" }}>
              Criar novo treino
            </button>
          </div>

          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nome do treino</th>
                  <th>Dia do treino</th>
                  <th>Última realização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((t) => (
                  <tr key={t.id}>
                    <td
                      onClick={() => setTreinoDetalhado(t)}
                      style={{ cursor: "pointer", color: "#2b2b2b", fontWeight: "600" }}
                    >
                      {t.nome}
                    </td>
                    <td>{t.dia || "A definir"}</td>
                    <td>{t.ultima || "Nunca realizado"}</td>
                    <td className="crud-acoes">
                      <button className="crud-acao-btn crud-acao-btn--play" title="Iniciar Treino" onClick={() => navigate(`/execucao-treino/${t.id}`)}>
                        <IcPlay />
                      </button>
                      <button className="crud-acao-btn crud-acao-btn--edit" aria-label="Editar treino" onClick={() => abrirEdicao(t)}>
                        <IcEdit />
                      </button>
                      <button className="crud-acao-btn crud-acao-btn--delete" aria-label="Excluir treino" onClick={() => setIdTreinoDeletar(t.id)}>
                        <IcTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan="4" className="crud-vazio">
                      Nenhum treino encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="crud-cards">
            {listaFiltrada.map((t) => (
              <div key={t.id} className="crud-card">
                <div className="crud-card-info" onClick={() => setTreinoDetalhado(t)} style={{ cursor: "pointer" }}>
                  <span className="crud-card-nome" style={{ color: "#1d1d1d" }}>{t.nome}</span>
                  <span className="crud-card-data">{t.ultima || "Nunca realizado"}</span>
                </div>
                <div className="crud-acoes">
                  <button className="crud-acao-btn crud-acao-btn--play" onClick={() => navigate(`/execucao-treino/${t.id}`)}><IcPlay /></button>
                  <button className="crud-acao-btn crud-acao-btn--edit" aria-label="Editar" onClick={() => abrirEdicao(t)}><IcEdit /></button>
                  <button className="crud-acao-btn crud-acao-btn--delete" aria-label="Excluir" onClick={() => setIdTreinoDeletar(t.id)}><IcTrash /></button>
                </div>
              </div>
            ))}
            <button className="crud-criar-btn crud-criar-btn--mobile" onClick={abrirCriacao}>
              Criar novo treino
            </button>
          </div>
        </>
      ) : (
        /* ── VISUALIZAÇÃO DETALHADA ── */
        <div className="detalhes-treino-completo">
          <div className="crud-topbar">
            <button className="btn-voltar-top" onClick={() => setTreinoDetalhado(null)}>
              ← Voltar para Lista
            </button>
          </div>

          <div className="crud-header" style={{ marginBottom: "20px" }}>
            <div>
              <h1 className="crud-titulo">{treinoDetalhado.nome}</h1>
              <p style={{ color: "#64748b", margin: "4px 0" }}>
                {treinoDetalhado.descricao || "Sem descrição informada."}
              </p>
              <span className="card-time-badge">
                Duração: {treinoDetalhado.duracaoMinutos} min
              </span>
            </div>
            <button className="crud-criar-btn" onClick={() => abrirEdicao(treinoDetalhado)}>
              Editar esta ficha
            </button>
          </div>

          <div
            className="split-form-layout"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}
          >
            {/* Foto do treino */}
            <div className="col-foto-container">
              <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
                Imagem Informativa do Treino
              </h3>
              {treinoDetalhado.foto ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                  <img
                    src={treinoDetalhado.foto}
                    alt="Foto do Treino"
                    style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label className="crud-criar-btn" style={{ padding: "8px 14px", fontSize: "0.85rem", cursor: "pointer" }}>
                      Alterar Foto
                      <input type="file" accept="image/*" onChange={handleUploadFoto} style={{ display: "none" }} />
                    </label>
                    <button
                      className="crud-acao-btn crud-acao-btn--delete"
                      style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 14px", borderRadius: "6px", border: "none", fontWeight: "600", cursor: "pointer" }}
                      onClick={handleExcluirFoto}
                    >
                      Excluir Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ border: "2px dashed #cbd5e1", padding: "4px 20px", borderRadius: "10px", textAlign: "center", background: "#f8fafc" }}>
                  <p style={{ color: "#64748b", margin: "15px 0" }}>
                    Nenhuma foto anexada a este treino.
                  </p>
                  <label className="crud-criar-btn" style={{ display: "inline-block", padding: "8px 16px", cursor: "pointer", marginBottom: "15px" }}>
                    📸 Fazer Upload de Foto
                    <input type="file" accept="image/*" onChange={handleUploadFoto} style={{ display: "none" }} />
                  </label>
                </div>
              )}
            </div>

            {/* Exercícios com imagens */}
            <div className="col-exercicios-container">
              <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
                Ficha de Exercícios ({treinoDetalhado.exercicios?.length || 0})
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {treinoDetalhado.exercicios?.map((ex, idx) => {
                  const exKey = ex._id || ex.id || idx;
                  const mediaAberto = exMediaAberto === exKey;
                  const embedUrl = converterVideoUrl(ex.videoUrl);
                  const gs = getGroupStyle(ex.grupo);

                  return (
                    <div
                      key={exKey}
                      style={{
                        background: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        overflow: "hidden",
                        transition: "box-shadow 0.2s",
                        boxShadow: mediaAberto ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                      }}
                    >
                      {/* Header com imagem mini + info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          cursor: "pointer",
                          background: mediaAberto ? "#f8fafc" : "transparent",
                        }}
                        onClick={() => setExMediaAberto(mediaAberto ? null : exKey)}
                      >
                        {/* Thumb */}
                        {ex.imagemUrl && (
                          <img
                            src={ex.imagemUrl}
                            alt={ex.nome}
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "10px",
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                            <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>
                              {ex.nome}
                            </strong>
                            {ex.grupo && (
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  background: gs.bg,
                                  color: gs.text,
                                  fontWeight: "600",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ex.grupo}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            {ex.series} séries × {ex.repeticoes} reps
                            {ex.carga > 0 && ` • ${ex.carga}kg`}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8", transition: "transform 0.2s", transform: mediaAberto ? "rotate(180deg)" : "none" }}>
                          ▼
                        </span>
                      </div>

                      {/* Conteúdo expandido */}
                      {mediaAberto && (
                        <div style={{ borderTop: "1px solid #e2e8f0" }}>
                          {/* Imagem grande */}
                          {ex.imagemUrl && (
                            <div style={{ padding: "12px", textAlign: "center", background: "#fafbfc" }}>
                              <img
                                src={ex.imagemUrl}
                                alt={`Como fazer: ${ex.nome}`}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                  borderRadius: "8px",
                                }}
                              />
                            </div>
                          )}
                          {/* Vídeo */}
                          {embedUrl && (
                            <div style={{ borderTop: ex.imagemUrl ? "1px solid #e2e8f0" : "none" }}>
                              <div style={{ padding: "6px 12px", background: "#f1f5f9", fontSize: "0.75rem", fontWeight: "600", color: "#475569" }}>
                                🎬 Vídeo Demonstrativo
                              </div>
                              <div style={{ position: "relative", paddingTop: "56.25%" }}>
                                <iframe
                                  src={embedUrl}
                                  title={`Vídeo: ${ex.nome}`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                                />
                              </div>
                            </div>
                          )}
                          {/* Observação */}
                          {ex.observacao && (
                            <div style={{ padding: "8px 14px", fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", background: "#fffbeb", borderTop: "1px solid #e2e8f0" }}>
                              💡 {ex.observacao}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!treinoDetalhado.exercicios || treinoDetalhado.exercicios.length === 0) && (
                  <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                    Nenhum exercício cadastrado nesta ficha.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MODAL: CRIAR/EDITAR TREINO
         ═══════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "900px", width: "100%", maxHeight: "90vh", overflow: "auto" }}>
            <h2>{idTreinoEdicao ? "Editar Ficha de Treino" : "Cadastrar Novo Treino"}</h2>

            <form onSubmit={handleSalvarTreino}>
              {/* Info básica */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div className="form-group">
                  <label>Nome do Treino *</label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Treino A - Peito e Tríceps"
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <input
                    type="text"
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Ex: Foco em hipertrofia"
                  />
                </div>
                <div className="form-group">
                  <label>Duração (min) *</label>
                  <input
                    type="number"
                    required
                    value={novaDuracao}
                    onChange={(e) => setNovaDuracao(e.target.value)}
                    placeholder="Ex: 60"
                  />
                </div>
              </div>

              {/* Exercícios adicionados */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <label style={{ fontWeight: "bold", fontSize: "1rem" }}>
                    Exercícios do Treino ({exerciciosForm.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(!showExercisePicker)}
                    style={{
                      background: showExercisePicker ? "#64748b" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      color: "#fff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      boxShadow: showExercisePicker ? "none" : "0 2px 8px rgba(37,99,235,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {showExercisePicker ? "✕ Fechar" : "+ Adicionar Exercício"}
                  </button>
                </div>

                {/* Cards dos exercícios já adicionados */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: showExercisePicker ? "16px" : "0" }}>
                  {exerciciosForm.map((ex) => {
                    const gs = getGroupStyle(ex.grupo);
                    return (
                      <div
                        key={ex.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          background: "#fff",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {/* Thumb mini */}
                        {ex.imagemUrl && (
                          <img
                            src={ex.imagemUrl}
                            alt={ex.nome}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong style={{ fontSize: "0.85rem" }}>{ex.nome}</strong>
                            {ex.grupo && (
                              <span style={{ fontSize: "0.6rem", padding: "1px 6px", borderRadius: "8px", background: gs.bg, color: gs.text, fontWeight: "600" }}>
                                {ex.grupo}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Inputs inline */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <input
                            type="number"
                            value={ex.series}
                            onChange={(e) => handleAtualizarExercicioNoForm(ex.id, "series", e.target.value)}
                            style={{ width: "42px", padding: "4px", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center", fontSize: "0.8rem" }}
                            title="Séries"
                          />
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>×</span>
                          <input
                            type="number"
                            value={ex.repeticoes}
                            onChange={(e) => handleAtualizarExercicioNoForm(ex.id, "repeticoes", e.target.value)}
                            style={{ width: "42px", padding: "4px", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center", fontSize: "0.8rem" }}
                            title="Reps"
                          />
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>reps</span>
                          <input
                            type="number"
                            value={ex.carga}
                            onChange={(e) => handleAtualizarExercicioNoForm(ex.id, "carga", e.target.value)}
                            style={{ width: "50px", padding: "4px", border: "1px solid #cbd5e1", borderRadius: "4px", textAlign: "center", fontSize: "0.8rem" }}
                            title="Carga"
                          />
                          <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverExercicioNoForm(ex.id)}
                          style={{ background: "none", border: "none", color: "#ef4444", fontSize: "1.1rem", cursor: "pointer", fontWeight: "bold", padding: "0 4px" }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {exerciciosForm.length === 0 && !showExercisePicker && (
                    <p style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.85rem", textAlign: "center", padding: "12px" }}>
                      Nenhum exercício adicionado. Clique em "+ Adicionar Exercício" para escolher do catálogo.
                    </p>
                  )}
                </div>
              </div>

              {/* ── EXERCISE PICKER ── */}
              {showExercisePicker && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <input
                      type="text"
                      placeholder="🔍 Buscar exercício..."
                      value={exerciseSearch}
                      onChange={(e) => setExerciseSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        background: "#fff",
                      }}
                      autoFocus
                    />
                  </div>

                  <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                    {Object.keys(gruposAgrupados).map((grupo) => {
                      const gs = getGroupStyle(grupo);
                      return (
                        <div key={grupo} style={{ marginBottom: "14px" }}>
                          <div style={{
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: gs.text,
                            background: gs.bg,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            display: "inline-block",
                          }}>
                            {grupo}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "8px" }}>
                            {gruposAgrupados[grupo].map((exCat) => {
                              const jaAdicionado = exerciciosForm.some(
                                (e) => e.catalogId === exCat.id || e.nome === exCat.nome,
                              );
                              return (
                                <button
                                  key={exCat.id}
                                  type="button"
                                  onClick={() => !jaAdicionado && handleSelecionarExercicio(exCat)}
                                  disabled={jaAdicionado}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "10px 8px",
                                    background: jaAdicionado ? "#f0fdf4" : "#fff",
                                    border: `1.5px solid ${jaAdicionado ? "#86efac" : "#e2e8f0"}`,
                                    borderRadius: "10px",
                                    cursor: jaAdicionado ? "default" : "pointer",
                                    opacity: jaAdicionado ? 0.6 : 1,
                                    transition: "all 0.15s",
                                    textAlign: "center",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!jaAdicionado) {
                                      e.currentTarget.style.borderColor = gs.border;
                                      e.currentTarget.style.boxShadow = `0 2px 8px ${gs.bg}`;
                                      e.currentTarget.style.transform = "translateY(-1px)";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = jaAdicionado ? "#86efac" : "#e2e8f0";
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.transform = "none";
                                  }}
                                >
                                  <img
                                    src={exCat.imagem}
                                    alt={exCat.nome}
                                    style={{
                                      width: "56px",
                                      height: "56px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  />
                                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#1e293b", lineHeight: "1.2" }}>
                                    {exCat.nome}
                                  </span>
                                  {jaAdicionado && (
                                    <span style={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: "600" }}>✓ Adicionado</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {exerciciosFiltrados.length === 0 && (
                      <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
                        Nenhum exercício encontrado para "{exerciseSearch}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="button" className="btn-cancelar" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  {idTreinoEdicao ? "Atualizar Ficha" : "Salvar Treino"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRMAR EXCLUSÃO ── */}
      {idTreinoDeletar !== null && (
        <div className="modal-overlay" style={{ zIndex: "1100" }}>
          <div className="modal-content" style={{ maxWidth: "400px", textAlign: "center" }}>
            <h3 style={{ color: "#dc2626", marginBottom: "10px" }}>
              Confirmar Exclusão
            </h3>
            <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5", marginBottom: "20px" }}>
              Tem certeza que deseja deletar este treino permanentemente? Todos
              os dados de exercícios e imagens vinculados serão perdidos.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button type="button" className="btn-cancelar" onClick={() => setIdTreinoDeletar(null)}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDeletar}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrudTreino;
