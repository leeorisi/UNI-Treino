/**
 * AuthContext — wrapper fino sobre o configStore (Zustand).
 *
 * O configStore já persiste token e usuario no localStorage.
 * Este context existe apenas para manter a interface que os componentes
 * já usam (isLoggedIn, user, login, logout) sem precisar expor o Zustand
 * diretamente em todos os lugares.
 */
import { createContext } from 'react';
import { useConfigStore } from '../../store/configStore';
import { api } from '../../lib/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

/**
 * Hook de autenticação.
 * Lê token e usuario do configStore.
 */
export function useAuth() {
  const { token, usuario, setToken, setUsuario, clearAll } = useConfigStore();

  /**
   * Chama POST /v1/login, salva token no store.
   *
   * TODO (backend): implementar validação real + retornar { token, usuario }
   */
  async function login(email, senha) {
    const response = await api.post('/v1/login', { email, senha });
    const novoToken = response.data?.token ?? response.data;
    setToken(novoToken);
    if (response.data?.usuario) {
      setUsuario(response.data.usuario);
    }
    return novoToken;
  }

  function logout() {
    clearAll();
  }

  return {
    user: usuario,
    isLoggedIn: !!token,
    token,
    login,
    logout,
  };
}
