import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCurrency, formatDate } from '../lib/format.js'

const categoryOptions = ['ground', 'referee', 'trophy', 'equipment', 'refreshments', 'medical', 'printing', 'other']

const emptyForm = {
  item: '',
  category: 'other',
  amount: '',
  paid_by: '',
  exp_date: new Date().toISOString().slice(0, 10),
  notes: '',
}

export default function ExpensesTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('expenditures')
      .select('*')
      .order('exp_date', { ascending: false })
    if (error) setError(error.message)
    else setRows(data)
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
    if (!form.item || !form.amount || !form.paid_by) return
    setSaving(true)
    setError('')

    const { data, error } = await supabase
      .from('expenditures')
      .insert({
        item: form.item.trim(),
        category: form.category,
        amount: Number(form.amount),
        paid_by: form.paid_by.trim(),
        exp_date: form.exp_date,
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
    if (!confirm('Delete this expense entry? This cannot be undone.')) return
    const { error } = await supabase.from('expenditures').delete().eq('id', id)
    if (error) setError(error.message)
    else setRows((r) => r.filter((row) => row.id !== id))
  }

  const total = rows.reduce((sum, r) => sum + Number(r.amount), 0)

  return (
    <div>
      <div className="panel-header">
        <h2>Expenses</h2>
        <span className="count-pill">{formatCurrency(total)} total</span>
      </div>

      {error && <p className="banner-error">{error}</p>}

      <form onSubmit={handleAdd} className="form form-inline">
        <label className="grow">
          Item
          <input required placeholder="e.g. Ground booking, Referee fee" value={form.item} onChange={(e) => update('item', e.target.value)} />
        </label>
        <label>
          Category
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} />
        </label>
        <label>
          Paid by
          <input required placeholder="Your name" value={form.paid_by} onChange={(e) => update('paid_by', e.target.value)} />
        </label>
        <label>
          Date
          <input type="date" value={form.exp_date} onChange={(e) => update('exp_date', e.target.value)} />
        </label>
        <label className="grow">
          Notes (optional)
          <input value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </label>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Adding…' : 'Add expense'}
        </button>
      </form>

      {loading ? (
        <p className="muted">Loading expenses…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No expenses logged yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Paid by</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.exp_date)}</td>
                  <td className="strong">{r.item}</td>
                  <td className="capitalize">{r.category}</td>
                  <td>{formatCurrency(r.amount)}</td>
                  <td>{r.paid_by}</td>
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
