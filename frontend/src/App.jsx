import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import SavedGamesPage from './pages/SavedGamesPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import GameHistoryPage from './pages/GameHistoryPage';
import useUserStore from './store/userStore';

function App() {
  const { loadUser } = useUserStore();

  useEffect(() => {
    // Load user from token on app start
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomId" element={<Game />} />
            <Route path="/saved-games" element={<SavedGamesPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game-history" element={<GameHistoryPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

