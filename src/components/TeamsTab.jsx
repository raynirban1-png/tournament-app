import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { formatDate } from '../lib/format.js'

const statusOptions = ['pending', 'partial', 'paid']

export default function TeamsTab() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('registered_at', { ascending: false })
    if (error) setError(error.message)
    else setTeams(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id, payment_status) {
    setTeams((t) => t.map((team) => (team.id === id ? { ...team, payment_status } : team)))
    const { error } = await supabase.from('teams').update({ payment_status }).eq('id', id)
    if (error) setError(error.message)
  }

  async function removeTeam(id) {
    if (!confirm('Remove this team registration? This cannot be undone.')) return
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) setError(error.message)
    else setTeams((t) => t.filter((team) => team.id !== id))
  }

  if (loading) return <p className="muted">Loading teams…</p>

  return (
    <div>
      <div className="panel-header">
        <h2>Registered teams</h2>
        <span className="count-pill">{teams.length}</span>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {teams.length === 0 ? (
        <p className="muted">No teams have registered yet. Share the registration link to get started.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Team</th>
                <th>Captain</th>
                <th>Contact</th>
                <th>Players</th>
                <th>Registered</th>
                <th>Payment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id}>
                  <td className="strong">{team.team_name}</td>
                  <td>{team.captain_name}</td>
                  <td>{team.captain_phone}</td>
                  <td>{team.player_count ?? '—'}</td>
                  <td>{formatDate(team.registered_at)}</td>
                  <td>
                    <select
                      className={`status-select status-${team.payment_status}`}
                      value={team.payment_status}
                      onChange={(e) => updateStatus(team.id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="btn-text danger" onClick={() => removeTeam(team.id)}>Remove</button>
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
