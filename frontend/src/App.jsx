import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Lobby from './pages/Lobby';
import Game from './pages/Game';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/lobby"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <Lobby />
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/game/:roomId"
            element={
              <>
                <Navbar />
                <div className="flex-grow">
                  <Game />
                </div>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

