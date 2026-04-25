import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Loader2, Trophy, AlertTriangle, BarChart3
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminStats() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [topScorers, setTopScorers] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [topsRes, discRes, standRes] = await Promise.all([
        api.get('/api/players/stats/topscorers'),
        api.get('/api/admin/discipline'),
        api.get('/api/admin/standings')
      ]);
      setTopScorers(topsRes.data);
      setDiscipline(discRes.data);
      setStandings(standRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        <header className="mb-6">
          <h1 className="font-['Bebas_Neue'] text-4xl text-[#ffd700] mb-1">LEAGUE STATISTICS</h1>
          <p className="text-white/40">Comprehensive league analytics</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00e676]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#00e676]" />
              </div>
              <div>
                <div className="font-['Bebas_Neue'] text-2xl text-white">{standings.reduce((a, s) => a + s.gf, 0)}</div>
                <div className="text-xs text-white/40">Total Goals</div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#ffd700]/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#ffd700]" />
              </div>
              <div>
                <div className="font-['Bebas_Neue'] text-2xl text-white">{standings.length}</div>
                <div className="text-xs text-white/40">Teams</div>
              </div>
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-['Bebas_Neue'] text-2xl text-white">{discipline.reduce((a, d) => a + d.yellowCards + d.redCards, 0)}</div>
                <div className="text-xs text-white/40">Total Cards</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Scorers */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">League Top Scorers</h3>
            <div className="space-y-3">
              {topScorers.slice(0, 10).map((ts, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center">
                    <span className="font-['Bebas_Neue'] text-sm text-[#ffd700]">{i + 1}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{ts.player?.name}</p>
                    <p className="text-[10px] text-white/30">{ts.player?.position} | {ts.player?.teamId?.name || 'Team'}</p>
                  </div>
                  <div className="font-['Bebas_Neue'] text-xl text-[#00e676]">{ts.goals}</div>
                </div>
              ))}
              {topScorers.length === 0 && <p className="text-white/30 text-sm text-center py-8">No goals recorded.</p>}
            </div>
          </div>

          {/* Discipline */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">Discipline Table</h3>
            <div className="space-y-3">
              {discipline.slice(0, 10).map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="font-['Bebas_Neue'] text-sm text-red-400">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{d.player?.name}</p>
                    <p className="text-[10px] text-white/30">{d.team?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold">{d.yellowCards} Y</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">{d.redCards} R</span>
                  </div>
                </div>
              ))}
              {discipline.length === 0 && <p className="text-white/30 text-sm text-center py-8">No cards recorded.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
