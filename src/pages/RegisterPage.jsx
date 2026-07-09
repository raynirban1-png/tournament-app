import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { buildUpiLink } from '../lib/upi.js'
import { formatCurrency } from '../lib/format.js'
import QrCode from '../components/QrCode.jsx'

const tournamentName = import.meta.env.VITE_TOURNAMENT_NAME || 'Tournament'
const fee = Number(import.meta.env.VITE_REGISTRATION_FEE || 0)

const emptyForm = {
  team_name: '',
  captain_name: '',
  captain_phone: '',
  captain_email: '',
  player_count: '',
  players: '',
  notes: '',
}

export default function RegisterPage() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle') // idle | saving | done | error
  const [errorMsg, setErrorMsg] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.team_name || !form.captain_name || !form.captain_phone) return

    setStatus('saving')
    setErrorMsg('')

    const { error } = await supabase.from('teams').insert({
      team_name: form.team_name.trim(),
      captain_name: form.captain_name.trim(),
      captain_phone: form.captain_phone.trim(),
      captain_email: form.captain_email.trim() || null,
      player_count: form.player_count ? Number(form.player_count) : null,
      players: form.players.trim() || null,
      notes: form.notes.trim() || null,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
      return
    }
    setStatus('done')
  }

  if (status === 'done') {
    const upiLink = buildUpiLink({ amount: fee, note: `${form.team_name} registration` })
    return (
      <div className="page">
        <div className="card confirm-card">
          <h1>You're registered</h1>
          <p className="muted">
            <strong>{form.team_name}</strong> is on the list. Complete payment below and keep the
            receipt/screenshot in case anyone asks.
          </p>

          {fee > 0 && (
            <div className="qr-block">
              <QrCode value={upiLink} />
              <p className="fee">{formatCurrency(fee)}</p>
              <p className="muted small">Scan with any UPI app — GPay, PhonePe, Paytm, etc.</p>
              {upiLink && (
                <a className="btn-primary btn-upi" href={upiLink}>
                  Pay via UPI app
                </a>
              )}
              <p className="muted small">On a phone? Tap the button above to pay directly.</p>
            </div>
          )}

          <button className="btn-secondary" onClick={() => { setForm(emptyForm); setStatus('idle') }}>
            Register another team
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="eyebrow">{tournamentName}</div>
        <h1>Team registration</h1>
        <p className="muted">Fill this in once per team. Takes about a minute.</p>

        {!isSupabaseConfigured && (
          <p className="banner-warning">
            Supabase isn't configured yet — this form can't save entries until VITE_SUPABASE_URL
            and VITE_SUPABASE_ANON_KEY are set.
          </p>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Team name
            <input required value={form.team_name} onChange={(e) => update('team_name', e.target.value)} />
          </label>

          <label>
            Captain's name
            <input required value={form.captain_name} onChange={(e) => update('captain_name', e.target.value)} />
          </label>

          <div className="field-row">
            <label>
              Captain's phone
              <input required type="tel" value={form.captain_phone} onChange={(e) => update('captain_phone', e.target.value)} />
            </label>
            <label>
              Captain's email (optional)
              <input type="email" value={form.captain_email} onChange={(e) => update('captain_email', e.target.value)} />
            </label>
          </div>

          <label>
            Number of players
            <input type="number" min="1" value={form.player_count} onChange={(e) => update('player_count', e.target.value)} />
          </label>

          <label>
            Player names (one per line, optional)
            <textarea rows={4} value={form.players} onChange={(e) => update('players', e.target.value)} />
          </label>

          <label>
            Notes (optional)
            <textarea rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
          </label>

          {status === 'error' && <p className="banner-error">Couldn't save that: {errorMsg}</p>}

          <button className="btn-primary" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Register team'}
          </button>
        </form>
      </div>

      <Link to="/admin" className="admin-link">Admin login</Link>
    </div>
  )
}
