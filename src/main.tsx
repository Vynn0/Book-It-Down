import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/LandingPage.tsx'
import { AuthProvider } from './components/auth'
import { SessionProvider } from './security'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </AuthProvider>
  </StrictMode>,
)
