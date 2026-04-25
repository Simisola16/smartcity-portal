import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Swords, FileCheck, Radio, Trophy,
  Loader2, TrendingUp
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/dashboard-stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Teams', value: stats?.totalTeams || 0, icon: Users, color: '#ffd700' },
    { label: 'Matches Played', value: stats?.playedMatches || 0, sub: `/ ${stats?.totalMatches || 0}`, icon: Swords, color: '#00e676' },
    { label: 'Pending Registrations', value: stats?.pendingRegs || 0, icon: FileCheck, color: '#ef4444' },
    { label: 'Live Matches', value: stats?.liveMatches || 0, icon: Radio, color: '#00e676' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e1a]">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#ffd700] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="font-['Bebas_Neue'] text-4xl text-[#ffd700] mb-1 text-glow-gold">ADMIN DASHBOARD</h1>
          <p className="text-white/40">League management overview</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <div key={i} className="glass-card p-5 hover:bg-white/[0.08] transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-white/10" />
              </div>
              <div className="flex items-baseline gap-1">
                <div className="font-['Bebas_Neue'] text-3xl text-white">{card.value}</div>
                {card.sub && <span className="text-sm text-white/30">{card.sub}</span>}
              </div>
              <div className="text-xs text-white/40">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Scorers League */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">League Top Scorers</h3>
            {stats?.topScorers?.length > 0 ? (
              <div className="space-y-3">
                {stats.topScorers.map((ts, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                      <span className="font-['Bebas_Neue'] text-sm text-[#ffd700]">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{ts.player?.name}</p>
                      <p className="text-[10px] text-white/30">{ts.team?.name}</p>
                    </div>
                    <div className="font-['Bebas_Neue'] text-xl text-[#00e676]">{ts.goals}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">No goals recorded yet.</p>
            )}
          </div>

          {/* Most Carded */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">Discipline Watch</h3>
            {stats?.mostCarded?.length > 0 ? (
              <div className="space-y-3">
                {stats.mostCarded.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <span className="font-['Bebas_Neue'] text-sm text-red-400">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{c.player?.name}</p>
                      <p className="text-[10px] text-white/30">{c.team?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold">{c.yellowCards} Y</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">{c.redCards} R</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">No cards recorded yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
