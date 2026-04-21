import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

function Navbar({ onMobileMenuClick, showVoltar = false }) {
  const { isLoggedIn, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-inner" aria-label="Navegação principal">

        <Link to="/" className="navbar-logo-link" aria-label="Início">
          <Logo size={30} />
        </Link>

        <div className="navbar-actions">
          {showVoltar ? (
            <button className="btn-logout" onClick={() => navigate(-1)}>
              Voltar
            </button>
          ) : isLoggedIn ? (
            <>
              {/* Sino — só desktop; no mobile fica na sidebar */}
              <Link
                to="/notificacoes"
                className="navbar-notif-btn"
                aria-label={`Notificações${unreadCount > 0 ? ` — ${unreadCount} não lidas` : ''}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge" aria-hidden="true">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <button className="btn-logout" onClick={handleLogout}>
                Log-out
              </button>

              <button
                className="navbar-hamburger"
                onClick={onMobileMenuClick}
                aria-label="Abrir menu"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6"  x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link to="/cadastro" className="navbar-link">Cadastre-se</Link>
              <Link to="/login" className="btn-login">Log-in</Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}

export default Navbar;
