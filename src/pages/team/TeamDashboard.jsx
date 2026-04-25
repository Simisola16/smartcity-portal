import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardCheck, Calendar, Trophy, Radio,
  TrendingUp, ChevronRight, Loader2, Shield
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TeamDashboard() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, regRes, matchesRes, standRes] = await Promise.all([
        api.get(`/api/teams/${user._id}/stats`),
        api.get('/api/registrations/my'),
        api.get(`/api/matches?teamId=${user._id}`),
        api.get('/api/admin/standings')
      ]);
      setStats(statsRes.data);
      setRegistration(regRes.data);
      setMatches(matchesRes.data);
      setStandings(standRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcoming = matches.filter(m => new Date(m.date) > now && m.status === 'scheduled').sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const recent = matches.filter(m => m.status === 'completed').sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const myStanding = standings.find(s => s.teamId === user?._id);

  const cards = [
    { label: 'Squad Size', value: stats ? `${stats.played > 0 ? 'N/A' : 'Check Squad'}` : '-', icon: Users, color: '#00e676', link: '/team/squad' },
    { label: 'Registration', value: registration ? (registration.status === 'approved' ? 'Approved' : registration.status) : 'Not Registered', icon: ClipboardCheck, color: '#ffd700', link: '/team/registration' },
    { label: 'Matches Played', value: stats?.played || 0, icon: Calendar, color: '#00e676', link: '/team/fixtures' },
    { label: 'League Position', value: myStanding ? `${myStanding.team?.name || ''} #${standings.indexOf(myStanding) + 1}` : '-', icon: Trophy, color: '#ffd700', link: '/team/standings' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a]">
        <TeamSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#00e676] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      <TeamSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">DASHBOARD OVERVIEW</h1>
          <p className="text-white/40">Welcome back, {user?.name}</p>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => navigate(card.link)}
              className="glass-card p-5 cursor-pointer hover:bg-white/[0.08] transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <div className="font-['Bebas_Neue'] text-2xl text-white">{card.value}</div>
              <div className="text-xs text-white/40">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Match */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#00e676]" />
              <h3 className="font-['Bebas_Neue'] text-xl text-white">Upcoming Match</h3>
            </div>
            {upcoming ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-7 h-7 text-[#00e676]" />
                    </div>
                    <p className="text-sm text-white font-medium">{upcoming.homeTeam?.name}</p>
                  </div>
                  <div className="px-4">
                    <div className="font-['Bebas_Neue'] text-3xl text-white/30">VS</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-7 h-7 text-[#ffd700]" />
                    </div>
                    <p className="text-sm text-white font-medium">{upcoming.awayTeam?.name}</p>
                  </div>
                </div>
                <div className="text-center text-sm text-white/40">
                  {new Date(upcoming.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  <br />
                  {upcoming.venue} | Matchday {upcoming.matchday}
                </div>
              </div>
            ) : (
              <p className="text-white/30 text-sm">No upcoming fixtures scheduled.</p>
            )}
          </div>

          {/* Recent Result */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#ffd700]" />
              <h3 className="font-['Bebas_Neue'] text-xl text-white">Recent Result</h3>
            </div>
            {recent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-sm text-white font-medium">{recent.homeTeam?.name}</p>
                  </div>
                  <div className="px-6 py-2 bg-white/5 rounded-lg">
                    <div className="font-['Bebas_Neue'] text-3xl text-white">
                      {recent.homeScore} - {recent.awayScore}
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-sm text-white font-medium">{recent.awayTeam?.name}</p>
                  </div>
                </div>
                <div className="text-center text-sm text-white/40">
                  {new Date(recent.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <span className="ml-3 px-2 py-0.5 rounded text-xs bg-[#00e676]/10 text-[#00e676]">{recent.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/30 text-sm">No completed matches yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 glass-card p-6">
          <h3 className="font-['Bebas_Neue'] text-xl text-white mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'View Squad', icon: Users, path: '/team/squad' },
              { label: 'Register Players', icon: ClipboardCheck, path: '/team/registration' },
              { label: 'Live Matches', icon: Radio, path: '/team/live' },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-[#00e676]/10 hover:border-[#00e676]/30 transition-all text-sm text-white/70 hover:text-[#00e676]"
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
