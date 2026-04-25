import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords, Plus, Trash2, Pencil, Shield, Loader2, Calendar,
  MapPin, ChevronRight, X, Save
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';

export default function AdminMatches() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    homeTeam: '', awayTeam: '', date: '', venue: '', matchday: 1, season: '2024/2025'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        api.get('/api/matches'),
        api.get('/api/teams')
      ]);
      setMatches(matchesRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/matches/${editing}`, form);
        toast.success('Match updated');
      } else {
        await api.post('/api/matches', form);
        toast.success('Match created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ homeTeam: '', awayTeam: '', date: '', venue: '', matchday: 1, season: '2024/2025' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this match?')) return;
    try {
      await api.delete(`/api/matches/${id}`);
      toast.success('Match deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (match) => {
    setEditing(match._id);
    setForm({
      homeTeam: match.homeTeam._id || match.homeTeam,
      awayTeam: match.awayTeam._id || match.awayTeam,
      date: match.date ? new Date(match.date).toISOString().slice(0, 16) : '',
      venue: match.venue || '',
      matchday: match.matchday || 1,
      season: match.season || '2024/2025'
    });
    setShowForm(true);
  };

  const startLive = (matchId) => {
    navigate(`/admin/live-control/${matchId}`);
  };

  const statusBadge = (status) => {
    const styles = {
      scheduled: 'bg-white/10 text-white/60',
      live: 'bg-red-500/20 text-red-400',
      halftime: 'bg-[#ffd700]/20 text-[#ffd700]',
      completed: 'bg-[#00e676]/10 text-[#00e676]',
      postponed: 'bg-red-500/10 text-red-400'
    };
    return styles[status] || styles.scheduled;
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
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-['Bebas_Neue'] text-4xl text-[#ffd700] mb-1">MATCH MANAGEMENT</h1>
            <p className="text-white/40">Create and manage fixtures</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm({ homeTeam: '', awayTeam: '', date: '', venue: '', matchday: 1, season: '2024/2025' }); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ffd700] text-[#0a0e1a] font-semibold rounded-lg hover:bg-[#ffe44d] transition-all"
          >
            <Plus className="w-4 h-4" /> New Match
          </button>
        </header>

        {/* Match Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-strong w-full max-w-lg p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Bebas_Neue'] text-2xl text-white">{editing ? 'Edit Match' : 'Create Match'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Home Team</label>
                    <select
                      value={form.homeTeam}
                      onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      required
                    >
                      <option value="" className="bg-[#0a0e1a]">Select team</option>
                      {teams.map(t => <option key={t._id} value={t._id} className="bg-[#0a0e1a]">{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Away Team</label>
                    <select
                      value={form.awayTeam}
                      onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      required
                    >
                      <option value="" className="bg-[#0a0e1a]">Select team</option>
                      {teams.map(t => <option key={t._id} value={t._id} className="bg-[#0a0e1a]">{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Venue</label>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      placeholder="Stadium name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Matchday</label>
                    <input
                      type="number"
                      value={form.matchday}
                      onChange={(e) => setForm({ ...form, matchday: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Season</label>
                    <input
                      type="text"
                      value={form.season}
                      onChange={(e) => setForm({ ...form, season: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-[#ffd700] text-[#0a0e1a] font-semibold rounded-lg hover:bg-[#ffe44d] transition-all flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {editing ? 'Update Match' : 'Create Match'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Matches Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Match</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Venue</th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium">Score</th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-white/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{match.homeTeam?.name}</span>
                        <span className="text-white/20">vs</span>
                        <span className="text-white font-medium">{match.awayTeam?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40">{new Date(match.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-3 text-white/40">{match.venue || '-'}</td>
                    <td className="text-center px-4 py-3 font-['Bebas_Neue'] text-lg text-white">
                      {match.homeScore} - {match.awayScore}
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${statusBadge(match.status)}`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {match.status === 'scheduled' && (
                          <button
                            onClick={() => startLive(match._id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-xs font-bold hover:bg-red-500/30 transition-all"
                          >
                            GO LIVE
                          </button>
                        )}
                        {(match.status === 'live' || match.status === 'halftime') && (
                          <button
                            onClick={() => startLive(match._id)}
                            className="px-3 py-1.5 bg-[#ffd700]/20 text-[#ffd700] rounded text-xs font-bold hover:bg-[#ffd700]/30 transition-all"
                          >
                            CONTROL
                          </button>
                        )}
                        <button onClick={() => startEdit(match)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-white/40" />
                        </button>
                        <button onClick={() => handleDelete(match._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
