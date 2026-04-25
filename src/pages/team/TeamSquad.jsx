import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Filter, Search, Shield, Loader2, User
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TeamSquad() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchPlayers();
  }, [user]);

  const fetchPlayers = async () => {
    try {
      const res = await api.get(`/api/teams/${user._id}/players`);
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const positions = ['ALL', 'GK', 'DEF', 'MID', 'FWD'];
  const posColors = { GK: 'pos-gk', DEF: 'pos-def', MID: 'pos-mid', FWD: 'pos-fwd' };
  const posLabels = { GK: 'Goalkeeper', DEF: 'Defender', MID: 'Midfielder', FWD: 'Forward' };

  const filtered = players.filter(p => {
    const matchesPos = filter === 'ALL' || p.position === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesPos && matchesSearch;
  });

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
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">MY SQUAD</h1>
          <p className="text-white/40">{players.length} players in your roster</p>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
            {positions.map(pos => (
              <button
                key={pos}
                onClick={() => setFilter(pos)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === pos
                    ? 'bg-[#00e676]/20 text-[#00e676]'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {pos === 'ALL' ? 'All' : pos}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#00e676]/50 transition-all text-sm"
            />
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((player, i) => (
            <div key={player._id} className="glass-card p-5 hover:bg-white/[0.08] transition-all group animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                  {player.photo ? (
                    <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-white/30" />
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${posColors[player.position]}`}>
                  {player.position}
                </span>
              </div>
              <h3 className="font-['Bebas_Neue'] text-xl text-white mb-1">{player.name}</h3>
              <p className="text-xs text-white/40 mb-3">{posLabels[player.position]}</p>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                <div className="text-center">
                  <div className="font-['Bebas_Neue'] text-lg text-[#00e676]">#{player.jerseyNumber || '-'}</div>
                  <div className="text-[10px] text-white/30 uppercase">Kit</div>
                </div>
                <div className="text-center">
                  <div className="font-['Bebas_Neue'] text-lg text-white">{player.age || '-'}</div>
                  <div className="text-[10px] text-white/30 uppercase">Age</div>
                </div>
                <div className="text-center">
                  <div className="font-['Bebas_Neue'] text-lg text-[#ffd700]">{player.nationality || 'NGA'}</div>
                  <div className="text-[10px] text-white/30 uppercase">Nat</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30">No players found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
