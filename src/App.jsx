import { useEffect, useState } from 'react'
import AccountPage from './AccountPage.jsx'
import AuthPage from './AuthPage.jsx'
import LegalPage from './LegalPage.jsx'
import Trade from './Trade.jsx'
import { supabase } from './lib/supabase.js'

function App() {
  const [page, setPage] = useState('dashboard')
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [legalSection, setLegalSection] = useState('terms')
  const [legalReturnPage, setLegalReturnPage] = useState('dashboard')

  useEffect(() => {
    if (!supabase) return undefined

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function openAuth(mode) {
    setAuthMode(mode)
    setPage('auth')
  }

  function finishAuthentication() {
    setPage('dashboard')
  }

  function openLegal(section, returnPage = page) {
    setLegalSection(section)
    setLegalReturnPage(returnPage)
    setPage('legal')
  }

  return (
    page === 'legal'
      ? <LegalPage initialSection={legalSection} onBack={() => setPage(legalReturnPage)} />
      : page === 'auth'
        ? <AuthPage initialMode={authMode} onBack={() => setPage('dashboard')} onAuthenticated={finishAuthentication} onLegalNavigation={(section) => openLegal(section, 'auth')} />
        : page === 'account'
          ? <AccountPage user={user} onBack={() => setPage('dashboard')} onAuthNavigation={openAuth} onLegalNavigation={(section) => openLegal(section, 'account')} />
          : <Trade user={user} onAuthNavigation={openAuth} onAccountNavigation={() => setPage('account')} onLegalNavigation={(section) => openLegal(section, 'dashboard')} />
  )
}

export default App
