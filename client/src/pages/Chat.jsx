import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useAuth } from "../context/AuthContext";
import { api } from "../../lib/api";
import {
  createChat,
  getChatById,
  getChats,
  getChatsAsync,
  saveChatMessages,
  updateChat,
} from "../lib/chatStorage";

const GUEST_CHAT_LIMIT = 3;
const GUEST_CHAT_COUNT_KEY = "unitreino_guest_chat_count";

const DIAS_SEMANA = [
  "segunda",
  "terca",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "sábado",
  "domingo",
];

function getGuestChatCount() {
  return Number(localStorage.getItem(GUEST_CHAT_COUNT_KEY) || 0);
}

function setGuestChatCount(count) {
  // localStorage.setItem(GUEST_CHAT_COUNT_KEY, String(count));
}

function StopButton({ onClick }) {
  return (
    <button
      className="stop-generation-btn"
      onClick={onClick}
      aria-label="Parar geracao"
    >
      <span className="stop-square" aria-hidden="true" />
      Parar geracao
    </button>
  );
}

function getFirstNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeExerciseName(name) {
  return String(name || "")
    .replace(/^[-*\d.\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDia(text) {
  const lower = text.toLowerCase();
  return DIAS_SEMANA.find((dia) => lower.includes(dia)) || "A definir";
}

function extractDuracao(text, exercicios) {
  const durationMatch = text.match(/(\d{2,3})\s*(min|mins|minutos)/i);
  if (durationMatch) return Number(durationMatch[1]);

  return Math.max(30, Math.min(90, exercicios.length * 8));
}

function extractWorkoutTitle(text) {
  const lines = text
    .split("\n")
    .map((line) => line.replace(/[#*_`]/g, "").trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) => /treino/i.test(line) && line.length <= 80) ||
    lines.find((line) => line.length <= 60);

  if (!titleLine) return "Treino criado pela IA";

  return titleLine
    .replace(/^treino\s*[:\-]\s*/i, "Treino ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function extractWorkoutFromAIResponse(text) {
  if (!text || typeof text !== "string") return null;

  const hasWorkoutLanguage = /treino|exerc/i.test(text);
  const hasPrescriptionLanguage = /s[eé]ries?|repeti[cç][oõ]es?|reps?/i.test(
    text,
  );

  if (!hasWorkoutLanguage || !hasPrescriptionLanguage) return null;

  const exercicios = text
    .split("\n")
    .map((line) => line.trim())
    .reduce((acc, line) => {
      const compactLine = line.replace(/\*\*/g, "");
      const exerciseMatch = compactLine.match(
        /^(?:[-*]\s*)?(?:\d+[.)]\s*)?(.+?)(?::|\s+-\s+)\s*(.+)$/i,
      );

      if (!exerciseMatch) return acc;

      const [, rawName, details] = exerciseMatch;
      if (!/s[eé]ries?|repeti[cç][oõ]es?|reps?/i.test(details)) return acc;

      const seriesMatch = details.match(/(\d+)\s*(?:s[eé]ries?|x\b)/i);
      const repsMatch =
        details.match(
          /(?:de\s*)?(\d+)(?:\s*(?:a|-)\s*\d+)?\s*(?:repeti[cç][oõ]es?|reps?)/i,
        ) || details.match(/\d+\s*x\s*(\d+)/i);

      const series = seriesMatch ? Number(seriesMatch[1]) : null;
      const repeticoes = repsMatch ? Number(repsMatch[1]) : null;
      const nome = normalizeExerciseName(rawName);

      if (!nome || !series || !repeticoes) return acc;

      const cargaMatch = details.match(/(\d+)\s*kg/i);
      acc.push({
        nome,
        series,
        repeticoes,
        carga: cargaMatch ? Number(cargaMatch[1]) : 0,
        observacao: details.replace(/\s+/g, " ").trim(),
      });
      return acc;
    }, []);

  if (exercicios.length < 3) return null;

  const uniqueExercises = exercicios.filter(
    (ex, index, all) =>
      all.findIndex(
        (item) => item.nome.toLowerCase() === ex.nome.toLowerCase(),
      ) === index,
  );

  if (uniqueExercises.length < 3) return null;

  return {
    nome: extractWorkoutTitle(text),
    descricao: "Treino gerado automaticamente pelo chat com IA.",
    dia: extractDia(text),
    ultima: "Nunca realizado",
    duracaoMinutos: extractDuracao(text, uniqueExercises),
    exercicios: uniqueExercises,
  };
}

function enrichBotMessageWithWorkout(message) {
  if (message?.tipo !== "bot" || message.loading || message.error) return message;
  const treino = extractWorkoutFromAIResponse(message.conteudo);
  return treino ? { ...message, treino } : message;
}

function Chat() {
  const [setIdGerado, idGerado] = useState("");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();

  const [loadingBanco, setLoadingBanco] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ultimaMsgBot, setUltimaMsgBot] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [savingTreinoId, setSavingTreinoId] = useState(null);
  const [savedTreinoIds, setSavedTreinoIds] = useState({});

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const firstMsgSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    async function carregar() {
      const list = await getChatsAsync();
      if (mounted) setChats(list || []);
    }
    carregar();
    return () => (mounted = false);
  }, [id, messages]);

  useEffect(() => {
    let mounted = true;

    async function carregarMensagensDoBanco() {
      if (!id || id === "novo") {
        setMessages([]);
        return;
      }

      setLoadingBanco(true);
      try {
        const token = localStorage.getItem("token") || "";

        const response = await api.get(`/v1/chats/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mensagensDoBanco =
          response.data?.result?.chat?.[0]?.historico || [];

        if (mounted) {
          setMessages(mensagensDoBanco.map(enrichBotMessageWithWorkout));
        }
      } catch (err) {
        console.error("Erro ao carregar mensagens do banco:", err);
        if (mounted) setMessages([]);
      } finally {
        if (mounted) setLoadingBanco(false);
      }
    }

    window.dispatchEvent(new Event("chatCriado"));

    carregarMensagensDoBanco();

    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !isGenerating) {
      navigate(location.pathname, { replace: true, state: {} });
      sendMessage(firstMessage);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !firstMsgSentRef.current) {
      firstMsgSentRef.current = true;
      sendMessage(firstMessage);
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.removeItem(GUEST_CHAT_COUNT_KEY);
      setShowLoginRequired(false);
    } else if (getGuestChatCount() >= GUEST_CHAT_LIMIT) {
      setShowLoginRequired(true);
    }
  }, [isLoggedIn]);

  async function sendMessage(text, retryBotId = null) {
    if (!isLoggedIn && !retryBotId && getGuestChatCount() >= GUEST_CHAT_LIMIT) {
      setShowLoginRequired(true);
      return;
    }

    const msgIdUsuario = `user-${Date.now()}`;
    const botId = retryBotId ?? `bot-${Date.now()}`;

    if (!retryBotId) {
      setMessages((prev) => [
        ...prev,
        { id: msgIdUsuario, tipo: "usuario", conteudo: text },
      ]);
    }

    setMessages((prev) => {
      const already = prev.find((m) => m.id === botId);
      if (already) {
        return prev.map((m) =>
          m.id === botId
            ? { ...m, conteudo: "", loading: true, error: false }
            : m,
        );
      }
      return [
        ...prev,
        { id: botId, tipo: "bot", conteudo: "", loading: true, error: false },
      ];
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setUltimaMsgBot(null);
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    timeoutRef.current = timeoutId;

    try {
      const authToken = token || localStorage.getItem("token") || "";
      const responseIA = await api.post(
        "/v1/mensagem",
        { mensagem: text },
        {
          signal: controller.signal,
          headers:
            isLoggedIn && authToken
              ? { Authorization: `Bearer ${authToken}` }
              : undefined,
        },
      );

      const conteudoBot =
        responseIA.data?.Mensagem?.Resposta ??
        responseIA.data?.mensagem?.conteudo ??
        "Sem resposta do servidor.";
      const treino = extractWorkoutFromAIResponse(conteudoBot);

      if (isLoggedIn && authToken) {
        if (!id || id === "novo") {
          const resNovoChat = await api.post(
            "/v1/chats",
            {
              id: location.state?.idGerado,
              mensagem: text,
              resposta: conteudoBot,
              msgIdUsuario,
              msgIdBot: botId,
            },
            { headers: { Authorization: `Bearer ${authToken}` } },
          );

          if (location.state?.idGerado) {
            navigate(`/chat/${location.state?.idGerado}`, { replace: true });
          }
        } else {
          await api.post(
            `/v1/chats/${id}/mensagem`,
            {
              mensagem: text,
              resposta: conteudoBot,
              msgIdUsuario,
              msgIdBot: botId,
            },
            { headers: { Authorization: `Bearer ${authToken}` } },
          );
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, conteudo: conteudoBot, loading: false, treino }
            : m,
        ),
      );
      setUltimaMsgBot(botId);

      window.dispatchEvent(new Event("chatCriado"));
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                conteudo:
                  "Não foi possível processar a resposta. Tente novamente.",
                loading: false,
                error: true,
                onRetry: () => sendMessage(text, botId),
              }
            : m,
        ),
      );
    } finally {
      clearTimeout(timeoutId);
      timeoutRef.current = null;
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === "bot" && m.loading
          ? {
              ...m,
              loading: false,
              conteudo: m.conteudo || "[geracao interrompida]",
            }
          : m,
      ),
    );
  }

  async function handleAdicionarTreino(msg) {
    if (!msg?.treino || savingTreinoId) return;

    const authToken = token || localStorage.getItem("token") || "";
    if (!isLoggedIn || !authToken) {
      setShowLoginRequired(true);
      return;
    }

    setSavingTreinoId(msg.id);
    try {
      const response = await api.post("/v1/treinos", msg.treino, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.data?.operacaoFinalizada) {
        throw new Error(
          response.data?.mensagem?.detalhe ||
            response.data?.mensagem?.msg ||
            "Falha ao criar treino.",
        );
      }

      setSavedTreinoIds((prev) => ({ ...prev, [msg.id]: true }));
      window.dispatchEvent(new Event("treinoCriado"));
      alert("Treino criado com sucesso!");
    } catch (err) {
      console.error("Erro ao adicionar treino da IA:", err);
      alert(err.message || "Erro ao adicionar treino. Tente novamente.");
    } finally {
      setSavingTreinoId(null);
    }
  }

  return (
    <div className="chat-page">
      <div className="chat-body">
        <main className="chat-main" aria-label="Conversa">
          <div className="chat-messages" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {isLoggedIn &&
                  msg.tipo === "bot" &&
                  !msg.loading &&
                  !msg.error &&
                  msg.treino && (
                    <div className="chat-add-treino-area">
                      <button
                        className="chat-add-treino-btn"
                        onClick={() => handleAdicionarTreino(msg)}
                        disabled={savingTreinoId === msg.id || savedTreinoIds[msg.id]}
                      >
                        {savedTreinoIds[msg.id]
                          ? "Treino adicionado"
                          : savingTreinoId === msg.id
                            ? "Adicionando..."
                            : "Adicionar treino"}
                      </button>
                    </div>
                  )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isGenerating && (
            <div className="chat-stop-area">
              <StopButton onClick={handleStopGeneration} />
            </div>
          )}

          <div className="chat-input-area">
            <ChatInput
              onSend={(text) => sendMessage(text)}
              disabled={isGenerating || showLoginRequired}
            />
          </div>
        </main>
      </div>

      {showLoginRequired && !isLoggedIn && (
        <div
          className="modal-overlay auth-required-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-required-title"
        >
          <div className="modal-card auth-required-card">
            <h2 className="modal-title" id="auth-required-title">
              Entre para continuar
            </h2>
            <p className="modal-texto">
              Voce atingiu o limite de {GUEST_CHAT_LIMIT} mensagens gratuitas.
              Faca login ou crie uma conta para continuar usando o chat.
            </p>
            <div className="modal-acoes auth-required-actions">
              <button
                className="btn-secundario"
                type="button"
                onClick={() => navigate("/cadastro")}
              >
                Criar conta
              </button>
              <button
                className="auth-required-login-btn"
                type="button"
                onClick={() => navigate("/login")}
              >
                Log-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
