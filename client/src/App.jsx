import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

/**
 * App principal.
 * Novas rotas serão adicionadas aqui conforme as telas forem finalizadas pela UX.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Rotas futuras — descomentar conforme as telas ficarem prontas */}
        {/* <Route path="/login"         element={<Login />} /> */}
        {/* <Route path="/cadastro"      element={<Cadastro />} /> */}
        {/* <Route path="/chat"          element={<Chat />} /> */}
        {/* <Route path="/chat/:id"      element={<Chat />} /> */}
        {/* <Route path="/perfil"        element={<Perfil />} /> */}
        {/* <Route path="/notificacoes"  element={<Notificacoes />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
