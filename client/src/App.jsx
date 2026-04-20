import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import Home     from './pages/Home';
import NovoChat from './pages/NovoChat';
import Chat     from './pages/Chat';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/novo-chat" element={<NovoChat />} />
            <Route path="/chat/:id"  element={<Chat />} />

            {/* Rotas futuras */}
            {/* <Route path="/login"        element={<Login />} /> */}
            {/* <Route path="/cadastro"     element={<Cadastro />} /> */}
            {/* <Route path="/perfil"       element={<Perfil />} /> */}
            {/* <Route path="/notificacoes" element={<Notificacoes />} /> */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
