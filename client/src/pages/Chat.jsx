import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

/** Ícone de parar geração (quadrado) — RF06.3 */
function StopButton({ onClick }) {
  return (
    <button className="stop-generation-btn" onClick={onClick} aria-label="Parar geração">
      <span className="stop-square" aria-hidden="true" />
      Parar geração
    </button>
  );
}

function Chat() {
  const { id } = useParams();
  const location = useLocation();
  const { isLoggedIn, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  /* scroll automático ao receber nova mensagem */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* carrega histórico existente OU processa primeira mensagem vinda de NovoChat */
  useEffect(() => {
    const firstMessage = location.state?.firstMessage;

    if (firstMessage) {
      // Veio de NovoChat com uma mensagem já digitada
      sendMessage(firstMessage);
    } else if (id && id !== 'novo') {
      // Carrega últimas 10 mensagens — RF06.5
      // TODO: GET /api/conversas/:id/mensagens?limit=10
      // Por enquanto sem mensagens
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Limpa timers ao desmontar */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  function generateBotMsgId() {
    return `bot-${Date.now()}`;
  }

  async function sendMessage(text, retryBotId = null) {
    // Adiciona mensagem do usuário (se não for retry)
    if (!retryBotId) {
      const userMsg = { id: `user-${Date.now()}`, tipo: 'usuario', conteudo: text };
      setMessages((prev) => [...prev, userMsg]);
    }

    const botId = retryBotId ?? generateBotMsgId();

    // Adiciona placeholder da resposta do bot com loading
    setMessages((prev) => {
      const already = prev.find((m) => m.id === botId);
      if (already) {
        return prev.map((m) =>
          m.id === botId ? { ...m, conteudo: '', loading: true, error: false } : m
        );
      }
      return [...prev, { id: botId, tipo: 'bot', conteudo: '', loading: true, error: false }];
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    // Timeout de 30s — RF06.6
    timeoutRef.current = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, 30000);

    try {
      /**
       * TODO (Backend): Conectar ao endpoint de streaming da IA.
       *
       * Endpoint esperado: POST /api/chat/mensagem
       * Headers: Authorization: Bearer <token>
       * Body: { conversa_id: id, mensagem: text }
       * Resposta: text/event-stream (SSE)
       *
       * Exemplo de consumo SSE para streaming palavra a palavra:
       *
       * const response = await fetch('/api/chat/mensagem', {
       *   method: 'POST',
       *   headers: {
       *     'Content-Type': 'application/json',
       *     Authorization: `Bearer ${token}`,
       *   },
       *   body: JSON.stringify({ conversa_id: id, mensagem: text }),
       *   signal: abortControllerRef.current.signal,
       * });
       *
       * const reader = response.body.getReader();
       * const decoder = new TextDecoder();
       * let accumulated = '';
       *
       * while (true) {
       *   const { done, value } = await reader.read();
       *   if (done) break;
       *   const chunk = decoder.decode(value);
       *   accumulated += chunk;
       *   setMessages(prev =>
       *     prev.map(m => m.id === botId ? { ...m, conteudo: accumulated, loading: false } : m)
       *   );
       * }
       */

      // ── Simulação local (remover quando o backend estiver pronto) ──
      await simulateStreaming(botId, text);

    } catch (err) {
      const isAbort = err.name === 'AbortError';
      if (!isAbort) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? { ...m, loading: false, error: true, onRetry: () => sendMessage(text, botId) }
              : m
          )
        );
      }
    } finally {
      clearTimeout(timeoutRef.current);
      setIsGenerating(false);
    }
  }

  /** Simula resposta progressiva (remover ao integrar o backend) */
  async function simulateStreaming(botId, userText) {
    const response =
      'Esta é uma resposta simulada do assistente UniTreino. ' +
      'Aqui aparecerá a resposta real da IA (Gemini) quando o backend estiver integrado.\n\n' +
      'Para criar um treino, envie uma mensagem como:\n' +
      '• Crie um treino de peito e tríceps\n' +
      '• Monte um treino de costas para iniciante\n' +
      '• Qual o melhor aquecimento para pernas?';

    const words = response.split(' ');
    let accumulated = '';

    for (const word of words) {
      await new Promise((r) => setTimeout(r, 40));
      accumulated += (accumulated ? ' ' : '') + word;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, conteudo: accumulated, loading: false } : m
        )
      );
    }
  }

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    // Marca a última mensagem do bot como interrompida
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === 'bot' && m.loading
          ? { ...m, loading: false, conteudo: m.conteudo + ' [geração interrompida]' }
          : m
      )
    );
  }

  return (
    <div className="chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="chat-body">
        {/* Sidebar desktop (só logado) */}
        {isLoggedIn && (
          <>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
              treinos={MOCK_TREINOS}
            />
            {/* Sidebar mobile drawer */}
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
              treinos={MOCK_TREINOS}
            />
          </>
        )}

        {/* Área de mensagens + input */}
        <main className="chat-main" aria-label="Conversa">
          <div className="chat-messages" aria-live="polite" aria-label="Mensagens">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Botão parar geração — RF06.3 */}
          {isGenerating && (
            <div className="chat-stop-area">
              <StopButton onClick={handleStopGeneration} />
            </div>
          )}

          {/* Input fixo no rodapé */}
          <div className="chat-input-area">
            <ChatInput
              onSend={(text) => sendMessage(text)}
              disabled={isGenerating}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Chat;
