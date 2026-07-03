import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatCurrency } from '../lib/format.js'

export default function BudgetTab() {
  const [teams, setTeams] = useState([])
  const [transactions, setTransactions] = useState([])
  const [expenditures, setExpenditures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const [teamsRes, txnRes, expRes] = await Promise.all([
      supabase.from('teams').select('id, payment_status'),
      supabase.from('transactions').select('amount, mode'),
      supabase.from('expenditures').select('amount, category'),
    ])
    const firstError = teamsRes.error || txnRes.error || expRes.error
    if (firstError) {
      setError(firstError.message)
    } else {
      setTeams(teamsRes.data)
      setTransactions(txnRes.data)
      setExpenditures(expRes.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) return <p className="muted">Loading budget…</p>
  if (error) return <p className="banner-error">{error}</p>

  const totalCollected = transactions.reduce((s, t) => s + Number(t.amount), 0)
  const totalSpent = expenditures.reduce((s, e) => s + Number(e.amount), 0)
  const balance = totalCollected - totalSpent

  const teamsPaid = teams.filter((t) => t.payment_status === 'paid').length
  const teamsPartial = teams.filter((t) => t.payment_status === 'partial').length
  const teamsPending = teams.filter((t) => t.payment_status === 'pending').length

  const byCategory = expenditures.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const categoryRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  const byMode = transactions.reduce((acc, t) => {
    acc[t.mode] = (acc[t.mode] || 0) + Number(t.amount)
    return acc
  }, {})
  const modeRows = Object.entries(byMode).sort((a, b) => b[1] - a[1])

  return (
    <div>
      <div className="panel-header">
        <h2>Budget overview</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total collected</span>
          <span className="stat-value">{formatCurrency(totalCollected)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total spent</span>
          <span className="stat-value">{formatCurrency(totalSpent)}</span>
        </div>
        <div className={`stat-card ${balance < 0 ? 'stat-negative' : 'stat-positive'}`}>
          <span className="stat-label">Balance in hand</span>
          <span className="stat-value">{formatCurrency(balance)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Teams registered</span>
          <span className="stat-value">{teams.length}</span>
        </div>
      </div>

      <div className="panel-header panel-header-tight">
        <h3>Team payment status</h3>
      </div>
      <div className="pill-row">
        <span className="status-pill status-paid">Paid: {teamsPaid}</span>
        <span className="status-pill status-partial">Partial: {teamsPartial}</span>
        <span className="status-pill status-pending">Pending: {teamsPending}</span>
      </div>

      <div className="two-col">
        <div>
          <div className="panel-header panel-header-tight">
            <h3>Expenses by category</h3>
          </div>
          {categoryRows.length === 0 ? (
            <p className="muted small">Nothing logged yet.</p>
          ) : (
            <ul className="breakdown-list">
              {categoryRows.map(([cat, amt]) => (
                <li key={cat}>
                  <span className="capitalize">{cat}</span>
                  <span>{formatCurrency(amt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="panel-header panel-header-tight">
            <h3>Collections by mode</h3>
          </div>
          {modeRows.length === 0 ? (
            <p className="muted small">Nothing logged yet.</p>
          ) : (
            <ul className="breakdown-list">
              {modeRows.map(([mode, amt]) => (
                <li key={mode}>
                  <span className="capitalize">{mode.replace('_', ' ')}</span>
                  <span>{formatCurrency(amt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
