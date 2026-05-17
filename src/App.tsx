import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [guestName, setGuestName] = useState('')

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <Login onLogin={(name) => {
          setIsAuthenticated(true)
          setGuestName(name)
        }} />
      ) : (
        <Dashboard
          guestName={guestName}
          onLogout={() => {
            setIsAuthenticated(false)
            setGuestName('')
          }}
        />
      )}
    </div>
  )
}

export default App
