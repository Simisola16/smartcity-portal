import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Radio, Play, Pause, Square, Plus, Goal, UserMinus, UserPlus,
  Clock, AlertTriangle, ArrowLeft, Loader2, Shield, SkipForward
} from 'lucide-react';
import { AdminSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLiveControl() {
  const { matchId } = useParams();
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentMinute, setCurrentMinute] = useState(0);
  const timerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('goal');
  const [eventForm, setEventForm] = useState({
    team: '', player: '', assistBy: '', playerOut: '', playerIn: '',
    minute: 0, isOwnGoal: false, isPenalty: false, description: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/admin/login'); return; }
    fetchMatchData();
    const socket = io(API_URL);
    socket.emit('joinMatch', matchId);
    socket.on('matchUpdate', (data) => {
      if (data.matchId === matchId) {
        setMatch(prev => prev ? { ...prev, homeScore: data.homeScore, awayScore: data.awayScore, minute: data.minute, status: data.status } : null);
        setCurrentMinute(data.minute);
      }
    });
    socket.on('matchEvent', (data) => {
      if (data.matchId === matchId) {
        setEvents(prev => [...prev, data.event]);
      }
    });
    socket.on('matchStatusChange', (data) => {
      if (data.matchId === matchId) {
        setMatch(prev => prev ? { ...prev, status: data.status, minute: data.minute } : null);
        setCurrentMinute(data.minute);
        if (data.status === 'completed') setTimerRunning(false);
      }
    });
    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [matchId, user]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setCurrentMinute(prev => {
          const next = prev + 1;
          // Auto broadcast minute update every 5 minutes
          if (next % 5 === 0) {
            const socket = io(API_URL);
            socket.emit('matchUpdate', { matchId, minute: next, homeScore: match?.homeScore || 0, awayScore: match?.awayScore || 0, status: match?.status || 'live' });
          }
          return next;
        });
      }, 60000); // 1 minute = 60 seconds for real time; for demo we could use 1000
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, match]);

  const fetchMatchData = async () => {
    try {
      const res = await api.get(`/api/matches/${matchId}`);
      setMatch(res.data.match);
      setEvents(res.data.events);
      setCurrentMinute(res.data.match.minute || 0);
      setTimerRunning(res.data.match.status === 'live');
      // Fetch players for both teams
      if (res.data.match.homeTeam) {
        const homeRes = await api.get(`/api/teams/${res.data.match.homeTeam._id || res.data.match.homeTeam}/players`);
        setHomePlayers(homeRes.data);
      }
      if (res.data.match.awayTeam) {
        const awayRes = await api.get(`/api/teams/${res.data.match.awayTeam._id || res.data.match.awayTeam}/players`);
        setAwayPlayers(awayRes.data);
      }
    } catch (err) {
      toast.error('Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await api.post(`/api/matches/${matchId}/start`);
      setTimerRunning(true);
      setMatch(prev => prev ? { ...prev, status: 'live', minute: 1 } : null);
      setCurrentMinute(1);
      toast.success('Match started!');
    } catch (err) {
      toast.error('Failed to start match');
    }
  };

  const handleHalfTime = async () => {
    try {
      await api.post(`/api/matches/${matchId}/halftime`);
      setTimerRunning(false);
      toast.success('Half time called');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleFullTime = async () => {
    try {
      await api.post(`/api/matches/${matchId}/fulltime`);
      setTimerRunning(false);
      toast.success('Full time! Match ended.');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const addEvent = async (type) => {
    const payload = {
      type,
      team: eventForm.team,
      player: eventForm.player || null,
      assistBy: eventForm.assistBy || null,
      playerOut: eventForm.playerOut || null,
      playerIn: eventForm.playerIn || null,
      minute: currentMinute,
      isOwnGoal: eventForm.isOwnGoal,
      isPenalty: eventForm.isPenalty,
      description: eventForm.description
    };
    try {
      const res = await api.post(`/api/matches/${matchId}/event`, payload);
      setEvents(prev => [...prev, res.data]);
      if (type === 'goal') {
        setMatch(prev => {
          if (!prev) return null;
          const isHome = prev.homeTeam._id === eventForm.team || prev.homeTeam === eventForm.team;
          return {
            ...prev,
            homeScore: isHome ? prev.homeScore + 1 : prev.homeScore,
            awayScore: isHome ? prev.awayScore : prev.awayScore + 1
          };
        });
      }
      toast.success(`${type} event recorded`);
      setEventForm({ team: '', player: '', assistBy: '', playerOut: '', playerIn: '', minute: 0, isOwnGoal: false, isPenalty: false, description: '' });
    } catch (err) {
      toast.error('Failed to add event');
    }
  };

  const getPlayersForTeam = (teamId) => {
    if (!match || !teamId) return [];
    const isHome = (match.homeTeam._id || match.homeTeam) === teamId;
    return isHome ? homePlayers : awayPlayers;
  };

  const eventIcon = (type) => {
    switch (type) {
      case 'goal': return <div className="w-6 h-6 rounded-full bg-[#00e676]/20 flex items-center justify-center"><span className="text-[#00e676] text-xs font-bold">G</span></div>;
      case 'yellowCard': return <div className="w-5 h-6 bg-[#ffd700] rounded-sm" />;
      case 'redCard': return <div className="w-5 h-6 bg-red-500 rounded-sm" />;
      case 'substitution': return <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center"><span className="text-blue-400 text-xs font-bold">S</span></div>;
      default: return <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><span className="text-white/40 text-xs">?</span></div>;
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

  if (!match) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0e1a]">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <button onClick={() => navigate('/admin/matches')} className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Matches
        </button>

        {/* Scoreboard */}
        <div className="glass-card-strong p-6 mb-6 gradient-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-400 live-pulse" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live Match Control</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <span className="font-['Bebas_Neue'] text-2xl text-white">{currentMinute}'</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-8 h-8 text-[#00e676]" />
              </div>
              <p className="text-lg font-medium text-white">{match.homeTeam?.name}</p>
            </div>
            <div className="px-8 py-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-['Bebas_Neue'] text-5xl text-white">
                {match.homeScore} - {match.awayScore}
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-8 h-8 text-[#ffd700]" />
              </div>
              <p className="text-lg font-medium text-white">{match.awayTeam?.name}</p>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3">
            {match.status === 'scheduled' && (
              <button onClick={handleStart} className="flex items-center gap-2 px-6 py-2.5 bg-[#00e676] text-[#0a0e1a] font-bold rounded-lg hover:bg-[#00c853] transition-all">
                <Play className="w-4 h-4" /> Start Match
              </button>
            )}
            {match.status === 'live' && (
              <>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-all"
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {timerRunning ? 'Pause' : 'Resume'}
                </button>
                <button onClick={handleHalfTime} className="flex items-center gap-2 px-5 py-2.5 bg-[#ffd700]/20 text-[#ffd700] rounded-lg hover:bg-[#ffd700]/30 transition-all">
                  <SkipForward className="w-4 h-4" /> Half Time
                </button>
              </>
            )}
            {(match.status === 'live' || match.status === 'halftime') && (
              <button onClick={handleFullTime} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                <Square className="w-4 h-4" /> Full Time
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Event Controls */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">Add Event</h3>

            <div className="flex gap-2 mb-4">
              {[
                { id: 'goal', label: 'Goal', icon: Goal },
                { id: 'yellowCard', label: 'Yellow', icon: AlertTriangle },
                { id: 'redCard', label: 'Red', icon: AlertTriangle },
                { id: 'substitution', label: 'Sub', icon: UserPlus },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? tab.id === 'yellowCard' ? 'bg-[#ffd700]/20 text-[#ffd700]' :
                        tab.id === 'redCard' ? 'bg-red-500/20 text-red-400' :
                        'bg-[#00e676]/20 text-[#00e676]'
                      : 'bg-white/5 text-white/40 hover:text-white/70'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Team</label>
                <select
                  value={eventForm.team}
                  onChange={(e) => setEventForm({ ...eventForm, team: e.target.value, player: '', assistBy: '', playerOut: '', playerIn: '' })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                >
                  <option value="" className="bg-[#0a0e1a]">Select team</option>
                  <option value={match.homeTeam._id || match.homeTeam} className="bg-[#0a0e1a]">{match.homeTeam.name} (Home)</option>
                  <option value={match.awayTeam._id || match.awayTeam} className="bg-[#0a0e1a]">{match.awayTeam.name} (Away)</option>
                </select>
              </div>

              {activeTab === 'goal' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Scorer</label>
                      <select
                        value={eventForm.player}
                        onChange={(e) => setEventForm({ ...eventForm, player: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      >
                        <option value="" className="bg-[#0a0e1a]">Select scorer</option>
                        {getPlayersForTeam(eventForm.team).map(p => (
                          <option key={p._id} value={p._id} className="bg-[#0a0e1a]">{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Assist (optional)</label>
                      <select
                        value={eventForm.assistBy}
                        onChange={(e) => setEventForm({ ...eventForm, assistBy: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                      >
                        <option value="" className="bg-[#0a0e1a]">None</option>
                        {getPlayersForTeam(eventForm.team).map(p => (
                          <option key={p._id} value={p._id} className="bg-[#0a0e1a]">{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <input
                        type="checkbox"
                        checked={eventForm.isPenalty}
                        onChange={(e) => setEventForm({ ...eventForm, isPenalty: e.target.checked })}
                        className="rounded border-white/20 bg-white/5"
                      />
                      Penalty
                    </label>
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <input
                        type="checkbox"
                        checked={eventForm.isOwnGoal}
                        onChange={(e) => setEventForm({ ...eventForm, isOwnGoal: e.target.checked })}
                        className="rounded border-white/20 bg-white/5"
                      />
                      Own Goal
                    </label>
                  </div>
                </>
              )}

              {(activeTab === 'yellowCard' || activeTab === 'redCard') && (
                <div>
                  <label className="block text-xs text-white/40 mb-1">Player</label>
                  <select
                    value={eventForm.player}
                    onChange={(e) => setEventForm({ ...eventForm, player: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                  >
                    <option value="" className="bg-[#0a0e1a]">Select player</option>
                    {getPlayersForTeam(eventForm.team).map(p => (
                      <option key={p._id} value={p._id} className="bg-[#0a0e1a]">{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'substitution' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Player Out</label>
                    <select
                      value={eventForm.playerOut}
                      onChange={(e) => setEventForm({ ...eventForm, playerOut: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                    >
                      <option value="" className="bg-[#0a0e1a]">Select</option>
                      {getPlayersForTeam(eventForm.team).map(p => (
                        <option key={p._id} value={p._id} className="bg-[#0a0e1a]">{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Player In</label>
                    <select
                      value={eventForm.playerIn}
                      onChange={(e) => setEventForm({ ...eventForm, playerIn: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffd700]/50"
                    >
                      <option value="" className="bg-[#0a0e1a]">Select</option>
                      {getPlayersForTeam(eventForm.team).map(p => (
                        <option key={p._id} value={p._id} className="bg-[#0a0e1a]">{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={() => addEvent(activeTab)}
                disabled={!eventForm.team || (activeTab === 'goal' && !eventForm.player) || ((activeTab === 'yellowCard' || activeTab === 'redCard') && !eventForm.player) || (activeTab === 'substitution' && (!eventForm.playerOut || !eventForm.playerIn))}
                className={`w-full py-2.5 font-bold rounded-lg transition-all ${
                  activeTab === 'yellowCard' ? 'bg-[#ffd700] text-[#0a0e1a] hover:bg-[#ffe44d]' :
                  activeTab === 'redCard' ? 'bg-red-500 text-white hover:bg-red-400' :
                  'bg-[#00e676] text-[#0a0e1a] hover:bg-[#00c853]'
                } disabled:opacity-40`}
              >
                Record {activeTab === 'yellowCard' ? 'Yellow Card' : activeTab === 'redCard' ? 'Red Card' : activeTab === 'substitution' ? 'Substitution' : 'Goal'}
              </button>
            </div>
          </div>

          {/* Match Timeline */}
          <div className="glass-card p-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#ffd700] mb-4">Match Timeline</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {events.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">No events yet. Start the match and add events.</p>
              )}
              {[...events].reverse().map((ev, i) => (
                <div key={ev._id || i} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="mt-0.5">{eventIcon(ev.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/40">{ev.minute}'</span>
                      <span className="text-sm font-medium text-white">
                        {ev.type === 'goal' ? 'Goal!' : ev.type === 'yellowCard' ? 'Yellow Card' : ev.type === 'redCard' ? 'Red Card' : ev.type === 'substitution' ? 'Substitution' : ev.type}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {ev.player?.name || ev.team?.name}
                      {ev.assistBy?.name && ` (Assist: ${ev.assistBy.name})`}
                      {ev.playerOut?.name && ev.playerIn?.name && ` (${ev.playerOut.name} → ${ev.playerIn.name})`}
                      {ev.isPenalty && ' (Penalty)'}
                      {ev.isOwnGoal && ' (Own Goal)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
