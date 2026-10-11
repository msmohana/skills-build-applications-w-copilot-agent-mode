import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import './App.css'

const sections = [
  { label: 'Activities', path: '/activities', description: 'Review recent training sessions.', icon: '↗' },
  { label: 'Leaderboard', path: '/leaderboard', description: 'See how the community is progressing.', icon: '★' },
  { label: 'Teams', path: '/teams', description: 'Meet your workout crew.', icon: '◎' },
  { label: 'Users', path: '/users', description: 'Explore tracker profiles.', icon: '◉' },
  { label: 'Workouts', path: '/workouts', description: 'Find your next training session.', icon: '▤' },
]

function Dashboard() {
  return (
    <>
      <section className="welcome-panel">
        <div>
          <p className="eyebrow">YOUR MOVEMENT, YOUR MOMENT</p>
          <h1>Small steps. Stronger days.</h1>
          <p className="welcome-copy">
            Keep your activity close, find your people, and celebrate every bit of progress.
          </p>
          <Link className="btn btn-primary rounded-pill px-4" to="/activities">
            Explore activity <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="welcome-mark" aria-hidden="true">OF</div>
      </section>

      <section aria-labelledby="explore-heading" className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE TRACKER</p>
            <h2 id="explore-heading">Explore OctoFit</h2>
          </div>
          <span className="text-secondary">Five ways to keep your momentum</span>
        </div>
        <div className="row g-3">
          {sections.map((section) => (
            <div className="col-12 col-md-6 col-xl-4" key={section.path}>
              <Link className="explore-card" to={section.path}>
                <span className="explore-icon" aria-hidden="true">{section.icon}</span>
                <span className="explore-card-copy">
                  <strong>{section.label}</strong>
                  <span>{section.description}</span>
                </span>
                <span className="explore-arrow" aria-hidden="true">↗</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link aria-label="OctoFit home" className="brand" to="/">
          <img alt="" className="brand-logo" src="/octofitapp-small.png" />
          <span>octofit<span className="brand-accent">.</span></span>
        </Link>
        <nav aria-label="Main navigation" className="main-nav">
          {sections.map((section) => (
            <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} key={section.path} to={section.path}>
              {section.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route element={<Dashboard />} path="/" />
          <Route element={<Activities />} path="/activities" />
          <Route element={<Leaderboard />} path="/leaderboard" />
          <Route element={<Teams />} path="/teams" />
          <Route element={<Users />} path="/users" />
          <Route element={<Workouts />} path="/workouts" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>Built for steady progress.</span>
        <span>OctoFit Tracker</span>
      </footer>
    </div>
  )
}

export default App
