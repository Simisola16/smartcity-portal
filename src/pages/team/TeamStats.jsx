import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Shield, Loader2, Trophy, AlertTriangle
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TeamStats() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [topScorers, setTopScorers] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [statsRes, topscorersRes, disciplineRes] = await Promise.all([
        api.get(`/api/teams/${user._id}/stats`),
        api.get('/api/players/stats/topscorers'),
        api.get('/api/admin/discipline')
      ]);
      setStats(statsRes.data);
      // Filter to my team's players
      const myTopScorers = topscorersRes.data.filter(ts => ts.player?.teamId === user._id);
      setTopScorers(myTopScorers);
      const myDiscipline = disciplineRes.data.filter(d => d.player?.teamId === user._id);
      setDiscipline(myDiscipline);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, sub, icon: Icon, color }) => (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4 text-white/10" />
      </div>
      <div className="font-['Bebas_Neue'] text-3xl text-white">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/20 mt-1">{sub}</div>}
    </div>
  );

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
        <header className="mb-6">
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">STATISTICS</h1>
          <p className="text-white/40">Team performance analytics</p>
        </header>

        {/* Team Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Goals Scored" value={stats.gf} icon={BarChart3} color="#00e676" />
            <StatCard label="Goals Conceded" value={stats.ga} icon={BarChart3} color="#ef4444" />
            <StatCard label="Clean Sheets" value={stats.cleanSheets} icon={Shield} color="#ffd700" />
            <StatCard label="Win Rate" value={`${stats.winRate}%`} sub={`${stats.won} wins`} icon={Trophy} color="#00e676" />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Scorers */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-white mb-4">Top Scorers</h3>
            {topScorers.length > 0 ? (
              <div className="space-y-3">
                {topScorers.map((ts, i) => (
                  <div key={ts.player?._id || i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                      <span className="font-['Bebas_Neue'] text-sm text-[#ffd700]">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{ts.player?.name}</p>
                      <p className="text-[10px] text-white/30">{ts.player?.position}</p>
                    </div>
                    <div className="font-['Bebas_Neue'] text-xl text-[#00e676]">{ts.goals}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/30 text-sm">No goals recorded yet.</p>
            )}
          </div>

          {/* Discipline */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-white mb-4">Discipline</h3>
            {discipline.length > 0 ? (
              <div className="space-y-3">
                {discipline.map((d, i) => (
                  <div key={d.player?._id || i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{d.player?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold">{d.yellowCards} Y</span>
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">{d.redCards} R</span>
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
