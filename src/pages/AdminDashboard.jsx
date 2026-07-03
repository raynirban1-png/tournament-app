import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import BudgetTab from '../components/BudgetTab.jsx'
import TeamsTab from '../components/TeamsTab.jsx'
import CollectionsTab from '../components/CollectionsTab.jsx'
import ExpensesTab from '../components/ExpensesTab.jsx'

const tabs = [
  { key: 'budget', label: 'Budget' },
  { key: 'teams', label: 'Teams' },
  { key: 'collections', label: 'Collections' },
  { key: 'expenses', label: 'Expenses' },
]

const tournamentName = import.meta.env.VITE_TOURNAMENT_NAME || 'Tournament'

export default function AdminDashboard() {
  const [active, setActive] = useState('budget')

  return (
    <div className="page admin-page">
      <header className="admin-header">
        <div>
          <div className="eyebrow">{tournamentName}</div>
          <h1>Admin dashboard</h1>
        </div>
        <button className="btn-secondary" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </header>

      <nav className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${active === t.key ? 'active' : ''}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {active === 'budget' && <BudgetTab />}
        {active === 'teams' && <TeamsTab />}
        {active === 'collections' && <CollectionsTab />}
        {active === 'expenses' && <ExpensesTab />}
      </div>
    </div>
  )
}
