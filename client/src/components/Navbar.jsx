import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useNotifications } from '../hooks/useNotifications';

/**
 * navbar do unitreino
 
 * estado logado: exibe o sino de notificações e botão "sair"
 * estado deslogado: exibe "cadastre-se" e botão "log-in"

 */
function Navbar({ isLoggedIn = false, onLogout }) {
  const { unreadCount } = useNotifications();

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-inner" aria-label="Navegação principal">

        {}
        <Link to="/" className="navbar-logo-link" aria-label="Ir para o início">
          <Logo size={32} />
        </Link>

        {}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              {/* sino de notificações (Observer badge) */}
              <Link
                to="/notificacoes"
                className="navbar-notif-btn"
                aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lidas` : ''}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <button
                className="btn-logout"
                onClick={onLogout}
                aria-label="Sair da conta"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/cadastro" className="navbar-link">
                Cadastre-se
              </Link>
              <Link to="/login" className="btn-login">
                Log-in
              </Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}

export default Navbar;
