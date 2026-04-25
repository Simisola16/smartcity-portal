import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'sonner'

import Home from './pages/Home.jsx'
import TeamLogin from './pages/TeamLogin.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import TeamDashboard from './pages/team/TeamDashboard.jsx'
import TeamSquad from './pages/team/TeamSquad.jsx'
import TeamRegistration from './pages/team/TeamRegistration.jsx'
import TeamFixtures from './pages/team/TeamFixtures.jsx'
import TeamStandings from './pages/team/TeamStandings.jsx'
import TeamLive from './pages/team/TeamLive.jsx'
import TeamStats from './pages/team/TeamStats.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMatches from './pages/admin/AdminMatches.jsx'
import AdminLiveControl from './pages/admin/AdminLiveControl.jsx'
import AdminTeams from './pages/admin/AdminTeams.jsx'
import AdminRegistrations from './pages/admin/AdminRegistrations.jsx'
import AdminStats from './pages/admin/AdminStats.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<TeamLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/team/dashboard" element={<TeamDashboard />} />
        <Route path="/team/squad" element={<TeamSquad />} />
        <Route path="/team/registration" element={<TeamRegistration />} />
        <Route path="/team/fixtures" element={<TeamFixtures />} />
        <Route path="/team/standings" element={<TeamStandings />} />
        <Route path="/team/live" element={<TeamLive />} />
        <Route path="/team/stats" element={<TeamStats />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/matches" element={<AdminMatches />} />
        <Route path="/admin/live-control/:matchId" element={<AdminLiveControl />} />
        <Route path="/admin/teams" element={<AdminTeams />} />
        <Route path="/admin/registrations" element={<AdminRegistrations />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}
