import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Eye, Loader2, MapPin, Calendar, User
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminTeams() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/api/teams');
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewTeam = async (team) => {
    setSelectedTeam(team);
    try {
      const res = await api.get(`/api/teams/${team._id}/players`);
      setTeamPlayers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const posColors = { GK: 'pos-gk', DEF: 'pos-def', MID: 'pos-mid', FWD: 'pos-fwd' };

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
          <h1 className="font-['Bebas_Neue'] text-4xl text-[#ffd700] mb-1">TEAMS MANAGEMENT</h1>
          <p className="text-white/40">All registered teams in the league</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Teams List */}
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => viewTeam(team)}
                className={`glass-card p-4 cursor-pointer hover:bg-white/[0.08] transition-all ${
                  selectedTeam?._id === team._id ? 'border-[#ffd700]/30 bg-[#ffd700]/5' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                    {team.badge ? (
                      <img src={team.badge} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-[#00e676]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{team.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/30 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {team.city}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Founded {team.founded}</span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Team Detail */}
          <div>
            {selectedTeam ? (
              <div className="glass-card p-6 sticky top-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                    {selectedTeam.badge ? (
                      <img src={selectedTeam.badge} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-8 h-8 text-[#00e676]" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-['Bebas_Neue'] text-2xl text-white">{selectedTeam.name}</h2>
                    <p className="text-sm text-white/40">Coach: {selectedTeam.coach || 'TBD'} | Stadium: {selectedTeam.stadium || 'TBD'}</p>
                  </div>
                </div>

                <h3 className="text-xs text-white/40 uppercase tracking-wider mb-3">Squad ({teamPlayers.length} players)</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {teamPlayers.map((player) => (
                    <div key={player._id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{player.name}</p>
                        <p className="text-[10px] text-white/30">Age {player.age} | #{player.jerseyNumber}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${posColors[player.position]}`}>
                        {player.position}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-white/30">Select a team to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
