import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatInput from '../components/ChatInput';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

/**
 * Mock de conversas — substituir por chamada a GET /api/conversas
 * quando o backend estiver pronto.
 */
const MOCK_TREINOS = [
  { id: '1', titulo: 'Upper completo' },
  { id: '2', titulo: 'Costa e ombro' },
  { id: '3', titulo: 'Legday completo' },
  { id: '4', titulo: 'Peito e tríceps' },
];

function NovoChat() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /**
   * Quando o usuário digita a primeira mensagem em NovoChat,
   * criamos a conversa (TODO: POST /api/conversas) e redirecionamos
   * para /chat/:novoId passando a mensagem como state.
   */
  function handleFirstMessage(text) {
    // TODO: chamar POST /api/conversas e obter o id da nova conversa
    // Por enquanto gera um id temporário e navega com a msg no state
    const tempId = 'novo';
    navigate(`/chat/${tempId}`, { state: { firstMessage: text } });
  }

  return (
    <div className="novo-chat-page">
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="novo-chat-body">
        {/* Sidebar só aparece se logado */}
        {isLoggedIn && (
          <>
            {/* Desktop — sidebar expandida por padrão no NovoChat */}
            <Sidebar
              collapsed={false}
              treinos={MOCK_TREINOS}
            />

            {/* Mobile — drawer */}
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onMobileClose={() => setMobileSidebarOpen(false)}
              treinos={MOCK_TREINOS}
            />
          </>
        )}

        {/* Área central */}
        <main className="novo-chat-main" aria-label="Novo chat">
          {/* Logo grande centralizada */}
          <div className="novo-chat-logo-area" aria-hidden="true">
            <Logo size={64} />
          </div>

          {/* Input centralizado no desktop, fixo no rodapé no mobile */}
          <div className="novo-chat-input-area">
            <ChatInput onSend={handleFirstMessage} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default NovoChat;
