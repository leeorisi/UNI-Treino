import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../../lib/api";

// ─── Ícones ───────────────────────────────────────────────────────────────────
function IcSearch() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IcFilter() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function IcUserPlus() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
  );
}

function IcUpload() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
function GestaoUsuarios() {
  const { user, isLoggedIn, authLoading } = useAuth();
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // ── Guarda de admin ────────────────────────────────────────────────────────
  // Só avalia depois que o authLoading terminar. Sem isso, o estado inicial
  // isLoggedIn=false redirecionaria o admin antes do token ser hidratado.
  useEffect(() => {
    if (authLoading) return; // aguarda hidratação
    if (!isLoggedIn || user?.role !== "admin") {
      navigate("/");
    }
  }, [authLoading, isLoggedIn, user, navigate]);

  // ── Carrega usuários ───────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || user?.role !== "admin") return;

    async function fetchUsuarios() {
      try {
        const { data } = await api.get("/v1/admin/usuarios");
        setUsuarios(data.result);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsuarios();
  }, [authLoading, isLoggedIn, user]);

  // ── Filtro ─────────────────────────────────────────────────────────────────
  const filtrado = usuarios.filter((u) => {
    const termo = busca.toLowerCase();
    const matchBusca =
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo);
    const matchRole = filtroRole === "todos" || u.role === filtroRole;
    return matchBusca && matchRole;
  });

  // ── Seleção ────────────────────────────────────────────────────────────────
  const todosSelec =
    filtrado.length > 0 && selecionados.length === filtrado.length;

  function toggleSelect(id) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelecionados(todosSelec ? [] : filtrado.map((u) => u.id));
  }

  // ── Toggle de role ─────────────────────────────────────────────────────────
  async function handleToggleRole(id, roleAtual) {
    const novoRole = roleAtual === "admin" ? "aluno" : "admin";
    setTogglingId(id);
    try {
      await api.put(`/v1/admin/usuarios/${id}`, { role: novoRole });
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: novoRole } : u)),
      );
    } catch (err) {
      console.error("Erro ao alterar papel:", err);
    } finally {
      setTogglingId(null);
    }
  }

  // Enquanto o auth ainda está resolvendo, não renderiza nada para evitar flash
  if (authLoading) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="chat-page">
      <div className="chat-body">
        <main className="crud-main" aria-label="Gestão de usuários">
          {/* ── Cabeçalho ── */}
          <div>
            <h1 className="crud-titulo">Gestão de usuários</h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                margin: "4px 0 14px",
              }}
            >
              Configure permissões, status e dados dos usuários na plataforma.
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                fontWeight: "600",
                marginBottom: "30px"
              }}
            >
              Usuários ({filtrado.length})
              {selecionados.length > 0 && (
                <span
                  style={{
                    fontWeight: "400",
                    color: "var(--text-secondary)",
                    marginLeft: "8px",
                  }}
                >
                  — {selecionados.length} selecionado(s)
                </span>
              )}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* ── Barra de pesquisa + botão filtrar ── */}
              <div className="crud-topbar">
                {/* ── Painel de filtros ── */}
                {mostrarFiltros && (
                  <div>
                    {[
                      { label: "Todos", value: "todos" },
                      { label: "Funcionários", value: "funcionario" },
                      { label: "Alunos", value: "aluno" },
                    ].map(({ label, value }) => (
                      <button
                        key={value}
                        onClick={() => setFiltroRole(value)}
                        style={{
                          padding: "6px 16px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--border-light)",
                          background:
                            filtroRole === value
                              ? "var(--color-primary, #2563eb)"
                              : "var(--bg-white)",
                          color:
                            filtroRole === value
                              ? "#fff"
                              : "var(--text-primary)",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="crud-search-wrap">
                  <span className="crud-search-icon">
                    <IcSearch />
                  </span>
                  <input
                    type="text"
                    className="crud-search"
                    placeholder="Pesquisar por nome ou e-mail..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    aria-label="Pesquisar usuários"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ── Tabela — desktop ── */}
          <div className="crud-table-wrap">
            {loading ? (
              <p
                style={{
                  padding: "24px",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                }}
              >
                Carregando usuários...
              </p>
            ) : (
              <table className="crud-table">
                <thead>
                  <tr>
                    {/* <th style={{ width: "40px" }}>
                      <input
                        type="checkbox"
                        checked={todosSelec}
                        onChange={toggleSelectAll}
                        aria-label="Selecionar todos"
                        style={{ cursor: "pointer" }}
                      />
                    </th> */}
                    <th>Usuários</th>
                    <th>Perfil de acesso</th>
                    <th style={{ width: "120px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          fontWeight: "500",
                        }}
                      >
                        Funcionário
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtrado.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        background: selecionados.includes(u.id)
                          ? "rgba(37,99,235,0.04)"
                          : undefined,
                      }}
                    >
                      {/* <td>
                        <input
                          type="checkbox"
                          checked={selecionados.includes(u.id)}
                          onChange={() => toggleSelect(u.id)}
                          aria-label={`Selecionar ${u.nome}`}
                          style={{ cursor: "pointer" }}
                        />
                      </td> */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "500",
                              color: "var(--text-primary)",
                            }}
                          >
                            {u.nome}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            background:
                              u.role === "admin"
                                ? "rgba(37,99,235,0.1)"
                                : "rgba(16,185,129,0.1)",
                            color:
                              u.role === "admin" ? "#2563eb" : "#059669",
                          }}
                        >
                          {u.role === "admin" ? "Funcionário" : "Aluno"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          className={`toggle-switch${u.role === "admin" ? " toggle-switch--on" : ""}`}
                          onClick={() => handleToggleRole(u.id, u.role)}
                          role="switch"
                          aria-checked={u.role === "admin"}
                          aria-label={`${u.nome}: ${u.role === "admin" ? "Funcionário" : "Aluno"}`}
                          disabled={togglingId === u.id}
                          style={{ opacity: togglingId === u.id ? 0.5 : 1 }}
                        >
                          <span className="toggle-thumb" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtrado.length === 0 && (
                    <tr>
                      <td colSpan="4" className="crud-vazio">
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Cards — mobile ── */}
          <div className="crud-cards">
            {loading ? (
              <p
                style={{
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "24px",
                }}
              >
                Carregando...
              </p>
            ) : (
              filtrado.map((u) => (
                <div
                  key={u.id}
                  className="crud-card"
                  style={{ alignItems: "flex-start", gap: "12px" }}
                >
                  <input
                    type="checkbox"
                    checked={selecionados.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                    style={{
                      marginTop: "3px",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />

                  <div className="crud-card-info" style={{ flex: 1 }}>
                    <span className="crud-card-nome">{u.nome}</span>
                    <span className="crud-card-data">{u.email}</span>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "4px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background:
                          u.role === "funcionario"
                            ? "rgba(37,99,235,0.1)"
                            : "rgba(16,185,129,0.1)",
                        color: u.role === "funcionario" ? "#2563eb" : "#059669",
                      }}
                    >
                      {u.role === "funcionario" ? "Funcionário" : "Aluno"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <button
                      className={`toggle-switch${u.role === "funcionario" ? " toggle-switch--on" : ""}`}
                      onClick={() => handleToggleRole(u.id, u.role)}
                      role="switch"
                      aria-checked={u.role === "funcionario"}
                      disabled={togglingId === u.id}
                      style={{ opacity: togglingId === u.id ? 0.5 : 1 }}
                    >
                      <span className="toggle-thumb" />
                    </button>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {u.role === "funcionario" ? "Func." : "Aluno"}
                    </span>
                  </div>
                </div>
              ))
            )}
            {!loading && filtrado.length === 0 && (
              <p
                style={{
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  padding: "16px",
                }}
              >
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default GestaoUsuarios;
