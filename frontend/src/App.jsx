import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomId" element={<Game />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

