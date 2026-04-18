import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main" aria-label="Página inicial">
        <div className="home-content">
          <h1 className="home-title">
            Bem vindo ao<br />
            <span>UNI Treino</span>
          </h1>
          <p className="home-subtitle">
            Faça suas perguntas relacionadas ao seu treino
          </p>
          <button
            className="btn-start-chat"
            onClick={() => navigate('/novo-chat')}
            aria-label="Iniciar um novo chat"
          >
            inicie um novo chat
          </button>
        </div>
      </main>
    </div>
  );
}

export default Home;
