import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * tela home deslogada
 */
function Home() {
  const navigate = useNavigate();

  function handleStartChat() {
    // redireciona para login se não autenticado, ou para o chat se já estiver logado.
    // por enquanto vai para login — a lógica de auth será integrada depois.
    navigate('/login');
  }

  return (
    <div className="home-page">
      <Navbar isLoggedIn={false} />

      <main className="home-main" aria-label="Página inicial">
        <div className="home-content">
          <h1 className="home-title">
            Bem-vindo(a) ao<br />
            <span>UNI Treino</span>
          </h1>

          <p className="home-subtitle">
            Faça suas perguntas relacionadas ao seu treino.
          </p>

          <button
            className="btn-start-chat"
            onClick={handleStartChat}
            aria-label="Iniciar um novo chat com o assistente"
          >
            Iniciar um novo bate-papo
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
