import { useState } from 'react'
import './AccountPage.css'
import { supabase } from './lib/supabase.js'

function AccountPage({ user, onBack, onAuthNavigation, onLegalNavigation }) {
  const [errorMessage, setErrorMessage] = useState('')

  async function signOut() {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) {
      setErrorMessage(error.message)
      return
    }
    setErrorMessage('')
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="account-eyebrow">NORTHSTAR ACCOUNT</p>
        <h1>{user ? 'Your account' : 'Welcome to Northstar'}</h1>
        {user
          ? <>
              <p className="account-description">You are signed in as <strong>{user.email}</strong>.</p>
              <button className="account-action" type="button" onClick={signOut}>Sign out</button>
            </>
          : <>
              <p className="account-description">Sign in or create an account to continue to your workspace.</p>
              <div className="account-actions">
                <button className="account-action" type="button" onClick={() => onAuthNavigation('login')}>Sign in</button>
                <button className="account-action secondary" type="button" onClick={() => onAuthNavigation('signup')}>Create account</button>
              </div>
            </>}
        {errorMessage && <p className="account-error" role="alert">Sign out failed: {errorMessage}</p>}
        <button className="account-back" type="button" onClick={onBack}>Back to workspace</button>
        <div className="account-legal-links">
          <button type="button" onClick={() => onLegalNavigation('terms')}>Terms of Service</button>
          <button type="button" onClick={() => onLegalNavigation('privacy')}>Privacy Policy</button>
        </div>
      </section>
    </main>
  )
}

export default AccountPage
