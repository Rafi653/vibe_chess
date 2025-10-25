import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus('Backend not reachable'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Vibe Chess</h1>
        <p>A modern web-based chess application</p>
        <div className="status">
          <p>Backend Status: <strong>{backendStatus}</strong></p>
          <p>API URL: <code>{API_URL}</code></p>
        </div>
      </header>
    </div>
  )
}

export default App
