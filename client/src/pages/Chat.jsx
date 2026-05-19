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
  { id: '4', titulo: 'Peito e triceps' },
];

function StopButton({ onClick }) {
  return (
    <button className="stop-generation-btn" onClick={onClick} aria-label="Parar geracao">
      <span className="stop-square" aria-hidden="true" />
      Parar geracao
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
  const [ultimaMsgBot, setUltimaMsgBot] = useState(null);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const firstMsgSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !firstMsgSentRef.current) {
      firstMsgSentRef.current = true;
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
      setMessages((prev) => [...prev, {
        id: `user-${Date.now()}`, tipo: 'usuario', conteudo: text
      }]);
    }

    const botId = retryBotId ?? `bot-${Date.now()}`;
    setMessages((prev) => {
      const already = prev.find((m) => m.id === botId);
      if (already) return prev.map((m) =>
        m.id === botId ? { ...m, conteudo: '', loading: true, error: false } : m
      );
      return [...prev, { id: botId, tipo: 'bot', conteudo: '', loading: true, error: false }];
    });

    setIsGenerating(true);
    setUltimaMsgBot(null);
    abortControllerRef.current = new AbortController();
    timeoutRef.current = setTimeout(() => abortControllerRef.current?.abort(), 30000);

    try {
      // POST para /v1/mensagem com o texto da mensagem no body
      const response = await api.post(
        '/v1/mensagem',
        { mensagem: text },
        { signal: abortControllerRef.current.signal }
      );

      // responseHandler retorna { Mensagem: { Resposta: "..." }, mensagem: { msg: "100..." } }
      const conteudo =
        response.data?.Mensagem?.Resposta ??
        response.data?.mensagem?.conteudo ??
        'Sem resposta do servidor.';

      setMessages((prev) =>
        prev.map((m) => m.id === botId ? { ...m, conteudo, loading: false } : m)
      );
      setUltimaMsgBot(botId);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setMessages((prev) =>
          prev.map((m) => m.id === botId
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

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === 'bot' && m.loading
          ? { ...m, loading: false, conteudo: m.conteudo || '[geracao interrompida]' }
          : m
      )
    );
  }

  function handleAdicionarTreino() {
    alert('Treino adicionado! (TODO: integrar com POST /v1/treinos)');
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
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {isLoggedIn && msg.id === ultimaMsgBot && msg.tipo === 'bot' && !msg.loading && !msg.error && (
                  <div className="chat-add-treino-area">
                    <button
                      className="chat-add-treino-btn"
                      onClick={handleAdicionarTreino}
                    >
                      Adicionar treino
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
              disabled={isGenerating}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Chat;
