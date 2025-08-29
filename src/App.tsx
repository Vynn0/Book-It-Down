import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { supabase } from './utils/supabase'

function App() {
  const [count, setCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<string>('Not tested')
  const [isLoading, setIsLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setIsLoading(true)
    setConnectionStatus('Testing...')
    
    try {
      // Simple test: get Supabase instance info
      const { error } = await supabase.auth.getSession()
      
      if (error) {
        setConnectionStatus(`❌ Error: ${error.message}`)
      } else {
        setConnectionStatus('✅ Supabase connected successfully!')
      }
    } catch (err) {
      setConnectionStatus(`❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

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
      <h1>Vite + React</h1>
      
      {/* Supabase Connection Test */}
      <div className="card">
        <h2>Supabase Connection Test</h2>
        <button 
          onClick={testSupabaseConnection} 
          disabled={isLoading}
          style={{ 
            backgroundColor: connectionStatus.includes('✅') ? '#4CAF50' : 
                            connectionStatus.includes('❌') ? '#f44336' : '#008CBA',
            margin: '10px 0'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Supabase Connection'}
        </button>
        <p style={{ 
          color: connectionStatus.includes('✅') ? '#4CAF50' : 
                 connectionStatus.includes('❌') ? '#f44336' : '#666',
          fontWeight: 'bold'
        }}>
          Status: {connectionStatus}
        </p>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
