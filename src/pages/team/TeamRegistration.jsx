import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Check, AlertCircle, Crown, Loader2, Shield, Save
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';

const DEADLINE = new Date('2025-12-31T23:59:59');

export default function TeamRegistration() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [existing, setExisting] = useState(null);
  const [captain, setCaptain] = useState('');
  const [viceCaptain, setViceCaptain] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [user]);

  const fetchData = async () => {
    try {
      const [playersRes, regRes] = await Promise.all([
        api.get(`/api/teams/${user._id}/players`),
        api.get('/api/registrations/my')
      ]);
      setPlayers(playersRes.data);
      if (regRes.data) {
        setExisting(regRes.data);
        setSelected(regRes.data.players.map(p => ({
          player: p.player._id || p.player,
          jerseyNumber: p.jerseyNumber,
          isCaptain: p.isCaptain,
          isViceCaptain: p.isViceCaptain,
          name: p.player.name || p.name
        })));
        const cap = regRes.data.players.find(p => p.isCaptain);
        const vice = regRes.data.players.find(p => p.isViceCaptain);
        if (cap) setCaptain(cap.player._id || cap.player);
        if (vice) setViceCaptain(vice.player._id || vice.player);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayer = (playerId) => {
    const exists = selected.find(s => s.player === playerId);
    if (exists) {
      setSelected(prev => prev.filter(s => s.player !== playerId));
      if (captain === playerId) setCaptain('');
      if (viceCaptain === playerId) setViceCaptain('');
    } else {
      if (selected.length >= 25) {
        toast.error('Maximum 25 players allowed');
        return;
      }
      setSelected(prev => [...prev, { player: playerId, jerseyNumber: '', isCaptain: false, isViceCaptain: false }]);
    }
  };

  const updateJersey = (playerId, num) => {
    const number = parseInt(num) || 0;
    const conflict = selected.find(s => s.player !== playerId && s.jerseyNumber === number && number > 0);
    if (conflict) {
      toast.warning(`Jersey #${number} is already assigned`);
    }
    setSelected(prev => prev.map(s => s.player === playerId ? { ...s, jerseyNumber: number } : s));
  };

  const handleCaptain = (playerId, type) => {
    if (type === 'captain') {
      setCaptain(playerId);
      setViceCaptain(prev => prev === playerId ? '' : prev);
    } else {
      setViceCaptain(playerId);
      setCaptain(prev => prev === playerId ? '' : prev);
    }
    setSelected(prev => prev.map(s => ({
      ...s,
      isCaptain: s.player === playerId ? type === 'captain' : s.isCaptain && type === 'captain' ? false : s.isCaptain,
      isViceCaptain: s.player === playerId ? type === 'vice' : s.isViceCaptain && type === 'vice' ? false : s.isViceCaptain
    })));
  };

  const handleSubmit = async () => {
    if (selected.length < 15) {
      toast.error('Minimum 15 players required');
      return;
    }
    if (selected.length > 25) {
      toast.error('Maximum 25 players allowed');
      return;
    }
    if (!captain) {
      toast.error('Please select a captain');
      return;
    }
    setSaving(true);
    try {
      const payload = selected.map(s => ({
        player: s.player,
        jerseyNumber: parseInt(s.jerseyNumber) || 1,
        isCaptain: s.player === captain,
        isViceCaptain: s.player === viceCaptain
      }));
      await api.post('/api/registrations', { season: '2024/2025', players: payload });
      toast.success('Registration submitted successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  const isDeadlinePassed = now > DEADLINE;
  const timeLeft = DEADLINE - now;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

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
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">LEAGUE REGISTRATION</h1>
          <p className="text-white/40">Select your squad for the 2024/2025 season</p>
        </header>

        {/* Deadline Timer */}
        <div className={`glass-card p-4 mb-6 flex items-center justify-between ${isDeadlinePassed ? 'border-red-500/30' : 'border-[#00e676]/20'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDeadlinePassed ? 'bg-red-500/20' : 'bg-[#00e676]/10'}`}>
              <AlertCircle className={`w-5 h-5 ${isDeadlinePassed ? 'text-red-400' : 'text-[#00e676]'}`} />
            </div>
            <div>
              <p className="text-sm text-white font-medium">Registration Deadline</p>
              <p className="text-xs text-white/40">December 31, 2025</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isDeadlinePassed ? (
              <span className="text-red-400 font-bold text-sm">Deadline Passed</span>
            ) : (
              ['Days', 'Hours', 'Mins', 'Secs'].map((unit, i) => (
                <div key={unit} className="text-center">
                  <div className="font-['Bebas_Neue'] text-2xl text-[#00e676]">
                    {[days, hours, minutes, seconds][i]}
                  </div>
                  <div className="text-[10px] text-white/30 uppercase">{unit}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Status Banner */}
        {existing && (
          <div className={`glass-card p-4 mb-6 flex items-center gap-3 ${
            existing.status === 'approved' ? 'border-[#00e676]/30 bg-[#00e676]/5' :
            existing.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' :
            'border-[#ffd700]/30 bg-[#ffd700]/5'
          }`}>
            <ClipboardList className={`w-5 h-5 ${
              existing.status === 'approved' ? 'text-[#00e676]' :
              existing.status === 'rejected' ? 'text-red-400' :
              'text-[#ffd700]'
            }`} />
            <div>
              <p className="text-sm text-white font-medium">
                Registration Status: <span className="capitalize">{existing.status}</span>
              </p>
              {existing.reviewNote && <p className="text-xs text-white/40 mt-1">Note: {existing.reviewNote}</p>}
            </div>
          </div>
        )}

        {/* Selection Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/40">
            Selected: <span className={`font-bold ${selected.length < 15 ? 'text-red-400' : selected.length > 25 ? 'text-red-400' : 'text-[#00e676]'}`}>{selected.length}</span> / 25 players
          </p>
          <p className="text-xs text-white/30">Min 15, Max 25</p>
        </div>

        {/* Players Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Select</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Player</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Position</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Jersey #</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Captain</th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">Vice</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => {
                  const isSelected = selected.find(s => s.player === player._id);
                  return (
                    <tr key={player._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePlayer(player._id)}
                          disabled={isDeadlinePassed}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#00e676] border-[#00e676]'
                              : 'border-white/20 hover:border-[#00e676]/50'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-[#0a0e1a]" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white/30" />
                          </div>
                          <span className="text-white font-medium">{player.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                          player.position === 'GK' ? 'pos-gk' :
                          player.position === 'DEF' ? 'pos-def' :
                          player.position === 'MID' ? 'pos-mid' : 'pos-fwd'
                        }`}>
                          {player.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          disabled={!isSelected || isDeadlinePassed}
                          value={isSelected ? isSelected.jerseyNumber : ''}
                          onChange={(e) => updateJersey(player._id, e.target.value)}
                          className="w-16 px-2 py-1 bg-white/5 border border-white/10 rounded text-center text-white text-sm focus:outline-none focus:border-[#00e676]/50 disabled:opacity-30"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCaptain(player._id, 'captain')}
                          disabled={!isSelected || isDeadlinePassed}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            captain === player._id
                              ? 'bg-[#ffd700] text-[#0a0e1a]'
                              : 'bg-white/5 text-white/20 hover:text-[#ffd700]'
                          } disabled:opacity-30`}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleCaptain(player._id, 'vice')}
                          disabled={!isSelected || isDeadlinePassed}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            viceCaptain === player._id
                              ? 'bg-[#00e676] text-[#0a0e1a]'
                              : 'bg-white/5 text-white/20 hover:text-[#00e676]'
                          } disabled:opacity-30`}
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={saving || isDeadlinePassed || selected.length < 15}
            className="flex items-center gap-2 px-8 py-3.5 bg-[#00e676] text-[#0a0e1a] font-semibold rounded-xl hover:bg-[#00c853] transition-all disabled:opacity-40 glow-green"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {existing ? 'Update Registration' : 'Submit Registration'}
          </button>
        </div>
      </main>
    </div>
  );
}
