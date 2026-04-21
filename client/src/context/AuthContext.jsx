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

export function useAuth() {
  const { token, usuario, setToken, setUsuario, clearAll } = useConfigStore();

  /**
   * Chama POST /v1/login, salva token no store.
   *
   * TODO (backend): implementar validação real + retornar { token, usuario }
   */
async function login(email, senha) {
  // ── LOGIN FAKE — remover quando o backend estiver pronto ──
  const FAKE_EMAIL = 'aluno@gmail.com';
  const FAKE_SENHA = 'senha123456789';

  if (email !== FAKE_EMAIL || senha !== FAKE_SENHA) {
    throw new Error('Credenciais inválidas.');
  }

  const fakeToken = 'fake-token-dev';
  const fakeUsuario = { nome: 'Aluno', email: FAKE_EMAIL };

  setToken(fakeToken);
  setUsuario(fakeUsuario);
  return fakeToken;
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
