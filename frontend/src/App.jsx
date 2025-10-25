import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [apiStatus, setApiStatus] = useState('Checking...')
  const [wsStatus, setWsStatus] = useState('Disconnected')

  useEffect(() => {
    // Test API connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => {
        setApiStatus(`Connected: ${data.message}`)
      })
      .catch(err => {
        setApiStatus(`Error: ${err.message}`)
      })

    // Test WebSocket connection
    const wsUrl = apiUrl.replace('http', 'ws')
    const ws = new WebSocket(`${wsUrl}/ws`)

    ws.onopen = () => {
      setWsStatus('Connected')
      ws.send('Hello from React!')
    }

    ws.onmessage = (event) => {
      console.log('WebSocket message:', event.data)
    }

    ws.onerror = () => {
      setWsStatus('Error')
    }

    ws.onclose = () => {
      setWsStatus('Disconnected')
    }

    return () => {
      ws.close()
    }
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vibe Chess</h1>
      <div className="card">
        <p>API Status: <strong>{apiStatus}</strong></p>
        <p>WebSocket Status: <strong>{wsStatus}</strong></p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Docker Dev Environment - Frontend: 5173, Backend: 5000
      </p>
    </>
  )
}

export default App
