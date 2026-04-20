import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { useAuth } from '../context/AuthContext';
import { api } from '../../lib/api';

const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

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
  const { isLoggedIn } = useAuth();

  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;
    if (firstMessage) {
      sendMessage(firstMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  async function sendMessage(text, retryBotId = null) {
    if (!retryBotId) {
      const userMsg = { id: `user-${Date.now()}`, tipo: 'usuario', conteudo: text };
      setMessages((prev) => [...prev, userMsg]);
    }

    const botId = retryBotId ?? `bot-${Date.now()}`;

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

    // Timeout 30s — RF06.6
    timeoutRef.current = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, 30000);

    try {
      /**
       * Endpoint: GET /v1/enviarMensagem
       * O backend retorna { Resposta: "..." }
       * TODO: migrar para POST com { mensagem: text, conversa_id: id }
       *       quando o controller.chat.js for implementado completamente.
       */
      const response = await api.get('/v1/enviarMensagem', {
        signal: abortControllerRef.current.signal,
      });

      const conteudo =
        response.data?.Resposta ??
        response.data?.mensagem?.conteudo ??
        response.data?.dados ??
        'Sem resposta do servidor.';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, conteudo, loading: false } : m
        )
      );
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  loading: false,
                  error: true,
                  onRetry: () => sendMessage(text, botId),
                }
              : m
          )
        );
      }
    } finally {
      clearTimeout(timeoutRef.current);
      setIsGenerating(false);
    }
  }

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === 'bot' && m.loading
          ? { ...m, loading: false, conteudo: m.conteudo || '[geração interrompida]' }
          : m
      )
    );
  }

  return (
    <div className="chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="chat-body">
        {isLoggedIn && (
          <>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed((v) => !v)}
              treinos={MOCK_TREINOS}
            />
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
              treinos={MOCK_TREINOS}
            />
          </>
        )}

        <main className="chat-main" aria-label="Conversa">
          <div className="chat-messages" aria-live="polite">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
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
              disabled={isGenerating}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Chat;
