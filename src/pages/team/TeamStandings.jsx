import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, TrendingUp, Loader2
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TeamStandings() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchStandings();
  }, [user]);

  const fetchStandings = async () => {
    try {
      const res = await api.get('/api/admin/standings');
      setStandings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">LEAGUE TABLE</h1>
          <p className="text-white/40">2024/2025 Season Standings</p>
        </header>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-white/40 font-medium w-14">#</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Team</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">P</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">W</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">D</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">L</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">GF</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">GA</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">GD</th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium">Pts</th>
                  <th className="text-center px-3 py-3 text-white/40 font-medium">Form</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  const isMyTeam = s.teamId === user?._id;
                  return (
                    <tr
                      key={s.teamId}
                      className={`border-b border-white/5 transition-all ${
                        isMyTeam ? 'bg-[#00e676]/5 border-[#00e676]/20' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-[#ffd700]/20 text-[#ffd700]' :
                          i === 1 ? 'bg-gray-400/20 text-gray-300' :
                          i === 2 ? 'bg-orange-400/20 text-orange-300' :
                          'bg-white/5 text-white/50'
                        }`}>
                          {i + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#00e676]" />
                          </div>
                          <div>
                            <p className={`font-medium ${isMyTeam ? 'text-[#00e676]' : 'text-white'}`}>{s.team?.name}</p>
                            <p className="text-[10px] text-white/30">{s.team?.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3 text-white/60">{s.played}</td>
                      <td className="text-center px-3 py-3 text-[#00e676]">{s.won}</td>
                      <td className="text-center px-3 py-3 text-[#ffd700]">{s.drawn}</td>
                      <td className="text-center px-3 py-3 text-red-400">{s.lost}</td>
                      <td className="text-center px-3 py-3 text-white/60">{s.gf}</td>
                      <td className="text-center px-3 py-3 text-white/60">{s.ga}</td>
                      <td className="text-center px-3 py-3 text-white/60">{s.gd > 0 ? '+' : ''}{s.gd}</td>
                      <td className="text-center px-4 py-3">
                        <span className="font-['Bebas_Neue'] text-xl text-[#00e676]">{s.points}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <div className="flex gap-0.5 justify-center">
                          {['W', 'D', 'W', 'L', 'W'].map((r, ri) => (
                            <div key={ri} className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold ${
                              r === 'W' ? 'bg-[#00e676]/20 text-[#00e676]' :
                              r === 'D' ? 'bg-[#ffd700]/20 text-[#ffd700]' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {r}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
