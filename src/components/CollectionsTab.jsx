import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCurrency, formatDate } from '../lib/format.js'

const modeOptions = ['cash', 'upi', 'bank_transfer', 'other']

const emptyForm = {
  team_id: '',
  payer_name: '',
  amount: '',
  collected_by: '',
  mode: 'cash',
  txn_date: new Date().toISOString().slice(0, 10),
  notes: '',
}

export default function CollectionsTab() {
  const [rows, setRows] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: txns, error: txnErr }, { data: teamRows, error: teamErr }] = await Promise.all([
      supabase.from('transactions').select('*').order('txn_date', { ascending: false }),
      supabase.from('teams').select('id, team_name').order('team_name'),
    ])
    if (txnErr) setError(txnErr.message)
    else if (teamErr) setError(teamErr.message)
    else {
      setRows(txns)
      setTeams(teamRows)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.payer_name || !form.amount || !form.collected_by) return
    setSaving(true)
    setError('')

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        team_id: form.team_id || null,
        payer_name: form.payer_name.trim(),
        amount: Number(form.amount),
        collected_by: form.collected_by.trim(),
        mode: form.mode,
        txn_date: form.txn_date,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()

    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setRows((r) => [data, ...r])
    setForm(emptyForm)
  }

  async function removeRow(id) {
    if (!confirm('Delete this collection entry? This cannot be undone.')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) setError(error.message)
    else setRows((r) => r.filter((row) => row.id !== id))
  }

  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0)
  const teamName = (id) => teams.find((t) => t.id === id)?.team_name

  return (
    <div>
      <div className="panel-header">
        <h2>Collections</h2>
        <span className="count-pill">{formatCurrency(total)} total</span>
      </div>

      {error && <p className="banner-error">{error}</p>}

      <form onSubmit={handleAdd} className="form form-inline">
        <label>
          Given by
          <input required placeholder="Payer name" value={form.payer_name} onChange={(e) => update('payer_name', e.target.value)} />
        </label>
        <label>
          Team (optional)
          <select value={form.team_id} onChange={(e) => update('team_id', e.target.value)}>
            <option value="">— not team-linked —</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.team_name}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
        </label>
        <label>
          Collected by
          <input required placeholder="Your name" value={form.collected_by} onChange={(e) => update('collected_by', e.target.value)} />
        </label>
        <label>
          Mode
          <select value={form.mode} onChange={(e) => update('mode', e.target.value)}>
            {modeOptions.map((m) => (
              <option key={m} value={m}>{m.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={form.txn_date} onChange={(e) => update('txn_date', e.target.value)} />
        </label>
        <label className="grow">
          Notes (optional)
          <input value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </label>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add entry'}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading collections…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No collections logged yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Given by</th>
                <th>Team</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Collected by</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.txn_date)}</td>
                  <td className="strong">{r.payer_name}</td>
                  <td>{teamName(r.team_id) || '—'}</td>
                  <td>{formatCurrency(r.amount)}</td>
                  <td className="capitalize">{r.mode.replace('_', ' ')}</td>
                  <td>{r.collected_by}</td>
                  <td className="muted small">{r.notes || '—'}</td>
                  <td>
                    <button className="btn-text danger" onClick={() => removeRow(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
