import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Ícones inline ── */
function IcMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IcPlusCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8"  y1="12" x2="16" y2="12" />
    </svg>
  );
}

function IcSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/* ── Conteúdo interno (reutilizado em expanded e mobile drawer) ── */
function SidebarContent({ treinos, user, onNewChat, onToggle, onItemClick }) {
  return (
    <>
      {/* Cabeçalho */}
      <div className="sidebar-header">
        <div className="sidebar-header-left">
          {onToggle && (
            <button className="sidebar-icon-btn" onClick={onToggle} aria-label="Recolher menu">
              <IcMenu />
            </button>
          )}
          <span className="sidebar-title">Treinos</span>
        </div>
        <button className="sidebar-icon-btn" onClick={onNewChat} aria-label="Novo chat">
          <IcPlusCircle />
        </button>
      </div>

      {/* Busca */}
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Search"
          className="sidebar-search-input"
          aria-label="Buscar treinos"
        />
        <span className="sidebar-search-icon"><IcSearch /></span>
      </div>

      {/* Lista de conversas/treinos */}
      <nav className="sidebar-nav" aria-label="Histórico de treinos">
        <span className="sidebar-section-label">Treinos</span>
        {treinos.length === 0 ? (
          <span className="sidebar-empty">Nenhum treino ainda</span>
        ) : (
          treinos.map((t) => (
            <Link
              key={t.id}
              to={`/chat/${t.id}`}
              className="sidebar-item"
              onClick={onItemClick}
            >
              {t.titulo}
            </Link>
          ))
        )}
      </nav>

      {/* Rodapé com usuário */}
      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-avatar" aria-hidden="true">
            {user.nome?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="sidebar-user-email">{user.email}</span>
        </div>
      )}
    </>
  );
}

/* ── Sidebar principal ── */
function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
  treinos = [],
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleNewChat() {
    navigate('/novo-chat');
    onMobileClose?.();
  }

  /* Desktop colapsado — só ícones */
  if (collapsed) {
    return (
      <aside className="sidebar sidebar--collapsed" aria-label="Menu lateral recolhido">
        <button className="sidebar-icon-btn" onClick={onToggle} aria-label="Expandir menu">
          <IcMenu />
        </button>
        <button className="sidebar-icon-btn" onClick={handleNewChat} aria-label="Novo chat">
          <IcPlusCircle />
        </button>
        {user && (
          <div className="sidebar-collapsed-footer">
            <div className="sidebar-avatar" title={user.email} aria-hidden="true">
              {user.nome?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        )}
      </aside>
    );
  }

  /* Mobile — drawer overlay */
  const isMobileMode = mobileOpen !== undefined && onMobileClose;
  if (isMobileMode) {
    return (
      <>
        {mobileOpen && (
          <div
            className="sidebar-overlay"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={`sidebar sidebar--mobile${mobileOpen ? ' sidebar--mobile-open' : ''}`}
          aria-label="Menu lateral"
          aria-hidden={!mobileOpen}
        >
          <SidebarContent
            treinos={treinos}
            user={user}
            onNewChat={handleNewChat}
            onItemClick={onMobileClose}
          />
        </aside>
      </>
    );
  }

  /* Desktop expandido */
  return (
    <aside className="sidebar sidebar--expanded" aria-label="Menu lateral">
      <SidebarContent
        treinos={treinos}
        user={user}
        onNewChat={handleNewChat}
        onToggle={onToggle}
      />
    </aside>
  );
}

export default Sidebar;
