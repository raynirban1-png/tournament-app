import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
  }

  return (
    <div className="page">
      <div className="card narrow">
        <div className="eyebrow">Admin</div>
        <h1>Sign in</h1>

        {!isSupabaseConfigured && (
          <p className="banner-warning">Supabase isn't configured yet — see README for setup.</p>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <p className="banner-error">{error}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted small">
          Admin accounts are created in the Supabase dashboard (Authentication → Users), not here.
        </p>
      </div>

      <Link to="/" className="admin-link">Back to registration form</Link>
    </div>
  )
}
