import { useState } from 'react'
import BrandMark from './BrandMark.jsx'
import { isSupabaseConfigured, supabase, supabaseConfigError } from './lib/supabase.js'
import './AuthPage.css'

function AuthPage({ initialMode = 'login', onBack, onAuthenticated, onLegalNavigation }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')

  const isSignup = mode === 'signup'
  const passwordRules = [
    { label: 'At least 8 characters', valid: form.password.length >= 8 },
    { label: 'One letter', valid: /[a-z]/i.test(form.password) },
    { label: 'One number', valid: /\d/.test(form.password) },
  ]
  const passwordStrength = passwordRules.filter((rule) => rule.valid).length
  const strengthLabels = [form.password ? 'Too short' : 'Enter a password', 'Weak', 'Fair', 'Strong']

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setMessageType('info')
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setMessage('')
  }

  async function submitForm(event) {
    event.preventDefault()
    if (isSignup && form.password !== form.confirmPassword) {
      setMessageType('error')
      setMessage('Your passwords do not match. Check both password fields and try again.')
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      setMessageType('error')
      setMessage(supabaseConfigError)
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { data: { full_name: form.name.trim() } },
        })
        if (error) throw error

        if (data.session) {
          onAuthenticated(data.user)
          return
        }

        setMessageType('success')
        setMessage('Account created. Check your email for a confirmation link, then sign in.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        })
        if (error) throw error
        onAuthenticated(data.user)
      }
    } catch (error) {
      setMessageType('error')
      setMessage(error instanceof TypeError && /fetch/i.test(error.message)
        ? 'The browser could not reach Supabase. Check that the Project URL in My-project/.env is the real URL from Project Settings → API, check your internet connection, then restart the Vite server.'
        : error.message || 'Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <a className="auth-brand" href="#dashboard" onClick={(event) => { event.preventDefault(); onBack() }}>
          <BrandMark className="auth-brand-mark" />
          <span>northstar<span>.</span></span>
        </a>

        <div className="auth-story-content">
          <span className="auth-kicker"><i /> YOUR MARKET WORKSPACE</span>
          <h1>Make room for<br />better decisions.</h1>
          <p>Bring your watchlists, charts, and market ideas together in one clear workspace.</p>
          <div className="auth-preview" aria-label="Illustrative market chart preview">
            <div className="auth-preview-top"><span>MARKET OVERVIEW</span><span className="auth-preview-live"><i /> DEMO</span></div>
            <div className="auth-preview-value">$68,420.18 <span>+2.84%</span></div>
            <svg viewBox="0 0 480 125" role="img" aria-label="Illustrative rising market chart">
              <defs>
                <linearGradient id="authChartFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#9b87f5" stopOpacity=".3" />
                  <stop offset="100%" stopColor="#9b87f5" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[25, 55, 85, 115].map((y) => <line key={y} x1="0" x2="480" y1={y} y2={y} />)}
              <path className="auth-preview-area" d="M0 94 L32 84 L61 91 L91 70 L120 77 L151 62 L180 69 L212 48 L241 60 L270 42 L301 55 L332 33 L360 43 L391 27 L421 36 L451 15 L480 20 L480 125 L0 125 Z" />
              <path className="auth-preview-line" d="M0 94 L32 84 L61 91 L91 70 L120 77 L151 62 L180 69 L212 48 L241 60 L270 42 L301 55 L332 33 L360 43 L391 27 L421 36 L451 15 L480 20" />
            </svg>
            <div className="auth-preview-footer"><span>1D</span><span>1W</span><span>1M</span><span>1Y</span><span>Illustrative data</span></div>
          </div>
        </div>
        <div className="auth-story-footer"><span>Built for curious, thoughtful investors.</span><span>© 2026 Northstar demo</span></div>
      </section>

      <section className="auth-form-side">
        <button className="auth-back" type="button" onClick={onBack}>← <span>Back to dashboard</span></button>
        <div className="auth-card">
          <div className="auth-mobile-brand"><BrandMark className="auth-brand-mark" /><span>northstar<span>.</span></span></div>
          <div className="auth-heading">
            <span className="auth-kicker">WELCOME TO NORTHSTAR</span>
            <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
            <p>{isSignup ? 'Start building your personal market workspace.' : 'Sign in to continue to your market workspace.'}</p>
          </div>

          <div className="auth-mode-tabs" role="tablist" aria-label="Choose sign-in or sign-up">
            <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => changeMode('login')}>Sign in</button>
            <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => changeMode('signup')}>Create account</button>
          </div>

          <form className="auth-form" onSubmit={submitForm}>
            {isSignup && (
              <label className="auth-field">
                <span>Full name</span>
                <input type="text" name="name" placeholder="Jordan Davis" autoComplete="name" value={form.name} onChange={updateField} required />
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <input type="email" name="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={updateField} required />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <span className="auth-password-wrap">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="At least 8 characters" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={8} value={form.password} onChange={updateField} required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button>
              </span>
            </label>

            {isSignup ? (
              <>
                <div className="password-strength" aria-live="polite">
                  <div className="password-strength-heading"><span>Password strength</span><strong className={`strength-label strength-${passwordStrength}`}>{strengthLabels[passwordStrength]}</strong></div>
                  <div className="strength-meter" aria-label={`${passwordStrength} of 3 password requirements met`}>
                    {passwordRules.map((rule) => <span className={rule.valid ? 'complete' : ''} key={rule.label} />)}
                  </div>
                  <ul className="password-rules">
                    {passwordRules.map((rule) => <li className={rule.valid ? 'valid' : ''} key={rule.label}><span aria-hidden="true">{rule.valid ? '✓' : '○'}</span>{rule.label}</li>)}
                  </ul>
                </div>
                <label className="auth-field">
                  <span>Confirm password</span>
                  <span className="auth-password-wrap">
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Enter your password again" autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={updateField} aria-invalid={Boolean(form.confirmPassword && form.password !== form.confirmPassword)} required />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}>{showPassword ? 'Hide' : 'Show'}</button>
                  </span>
                  {form.confirmPassword && <span className={`password-match ${form.password === form.confirmPassword ? 'match' : 'mismatch'}`}>{form.password === form.confirmPassword ? 'Passwords match' : 'Passwords do not match yet'}</span>}
                </label>
                <label className="auth-terms">
                  <input type="checkbox" required />
                  <span>I agree to the <a href="#terms" onClick={(event) => { event.preventDefault(); onLegalNavigation('terms') }}>Terms of Service</a> and <a href="#privacy" onClick={(event) => { event.preventDefault(); onLegalNavigation('privacy') }}>Privacy Policy</a>.</span>
                </label>
              </>
            ) : (
              <div className="auth-form-options">
                <label className="auth-remember"><input type="checkbox" /> <span>Remember me</span></label>
                <button className="auth-text-button" type="button" onClick={() => setMessage('Password reset is not configured in this app yet.')}>Forgot password?</button>
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'} <span aria-hidden="true">→</span></button>
            {message && <p className={`auth-message ${messageType}`} role="status">{message}</p>}
          </form>

          <div className="auth-separator"><span>OR</span></div>
          <button type="button" className="auth-provider-button" onClick={() => { setMessageType('info'); setMessage('Social sign-in is not connected in this demo.') }}>
            <span className="provider-g" aria-hidden="true">G</span>
            Continue with Google
          </button>

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Northstar?'}
            <button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>{isSignup ? 'Sign in' : 'Create an account'}</button>
          </p>
          <p className="auth-demo-note"><span aria-hidden="true">ⓘ</span> {isSupabaseConfigured ? 'Authentication is handled securely by Supabase.' : supabaseConfigError}</p>
        </div>
      </section>
    </main>
  )
}

export default AuthPage
