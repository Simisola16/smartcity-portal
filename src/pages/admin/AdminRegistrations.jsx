import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck, CheckCircle, XCircle, Loader2, Shield, Eye, Search
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';

export default function AdminRegistrations() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReg, setSelectedReg] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/api/admin/registrations');
      setRegistrations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, status) => {
    try {
      await api.put(`/api/admin/registrations/${id}`, { status, reviewNote });
      toast.success(`Registration ${status}`);
      setSelectedReg(null);
      setReviewNote('');
      fetchRegistrations();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const filtered = filter === 'ALL' ? registrations : registrations.filter(r => r.status === filter.toLowerCase());

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-[#ffd700]/20 text-[#ffd700]',
      approved: 'bg-[#00e676]/10 text-[#00e676]',
      rejected: 'bg-red-500/10 text-red-400'
    };
    return styles[status] || styles.pending;
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
          <h1 className="font-['Bebas_Neue'] text-4xl text-[#ffd700] mb-1">REGISTRATIONS</h1>
          <p className="text-white/40">Review and approve team squad registrations</p>
        </header>

        <div className="flex items-center gap-2 mb-6">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f ? 'bg-[#ffd700]/20 text-[#ffd700]' : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((reg) => (
            <div key={reg._id} className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-[#00e676]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{reg.team?.name}</h3>
                    <p className="text-xs text-white/40">{reg.players?.length} players | Season {reg.season}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${statusBadge(reg.status)}`}>
                    {reg.status}
                  </span>
                  <button
                    onClick={() => setSelectedReg(reg)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileCheck className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30">No registrations found.</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedReg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card-strong w-full max-w-2xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Bebas_Neue'] text-2xl text-white">{selectedReg.team?.name} Squad</h3>
                <button onClick={() => setSelectedReg(null)} className="p-1 hover:bg-white/10 rounded-lg">
                  <XCircle className="w-5 h-5 text-white/40" />
                </button>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-3 py-2 text-white/40">#</th>
                      <th className="text-left px-3 py-2 text-white/40">Player</th>
                      <th className="text-left px-3 py-2 text-white/40">Position</th>
                      <th className="text-left px-3 py-2 text-white/40">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReg.players?.map((p, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-3 py-2 text-white/60">{p.jerseyNumber}</td>
                        <td className="px-3 py-2 text-white font-medium">{p.player?.name || p.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.player?.position === 'GK' ? 'pos-gk' :
                            p.player?.position === 'DEF' ? 'pos-def' :
                            p.player?.position === 'MID' ? 'pos-mid' : 'pos-fwd'
                          }`}>
                            {p.player?.position || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {p.isCaptain && <span className="text-[#ffd700]">Captain</span>}
                          {p.isViceCaptain && <span className="text-[#00e676] ml-2">Vice Captain</span>}
                          {!p.isCaptain && !p.isViceCaptain && <span className="text-white/20">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedReg.status === 'pending' && (
                <div className="space-y-3">
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Review note (optional)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50 h-20 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDecision(selectedReg._id, 'approved')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00e676] text-[#0a0e1a] font-bold rounded-lg hover:bg-[#00c853] transition-all"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleDecision(selectedReg._id, 'rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/20 text-red-400 font-bold rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
