import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Radio, Shield, Loader2, Activity
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TeamLive() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchLiveMatches();
    const socket = io(API_URL);
    socket.on('matchUpdate', (data) => {
      setMatches(prev => prev.map(m => m._id === data.matchId
        ? { ...m, homeScore: data.homeScore, awayScore: data.awayScore, minute: data.minute, status: data.status }
        : m
      ));
    });
    socket.on('matchEvent', (data) => {
      // Could show toast for goals
    });
    socket.on('matchStatusChange', (data) => {
      setMatches(prev => prev.map(m => m._id === data.matchId
        ? { ...m, status: data.status, minute: data.minute }
        : m
      ));
    });
    return () => socket.disconnect();
  }, [user]);

  const fetchLiveMatches = async () => {
    try {
      const res = await api.get('/api/matches/live');
      setMatches(res.data);
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full bg-red-500 live-pulse" />
            <h1 className="font-['Bebas_Neue'] text-4xl text-white">LIVE SCORES</h1>
          </div>
          <p className="text-white/40">Real-time match updates</p>
        </header>

        <div className="grid gap-6">
          {matches.map((match) => (
            <div key={match._id} className="glass-card p-6 border-red-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400 live-pulse" />
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
                  <span className="text-xs text-white/30">|</span>
                  <span className="text-xs text-white/40">Matchday {match.matchday}</span>
                </div>
                <div className="text-xs text-white/40">{match.minute || 0}'</div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <div className="text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-8 h-8 text-[#00e676]" />
                  </div>
                  <p className="text-sm font-medium text-white">{match.homeTeam?.name}</p>
                </div>

                <div className="text-center">
                  <div className="font-['Bebas_Neue'] text-5xl text-white">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <div className="text-xs text-white/30 mt-1">{match.status === 'halftime' ? 'HALF TIME' : `${match.minute || 0} minutes`}</div>
                </div>

                <div className="text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-8 h-8 text-[#ffd700]" />
                  </div>
                  <p className="text-sm font-medium text-white">{match.awayTeam?.name}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-center text-xs text-white/30">
                {match.venue}
              </div>
            </div>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-16">
            <Radio className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30">No live matches at the moment.</p>
            <p className="text-white/20 text-sm mt-1">Check back during matchdays for live updates.</p>
          </div>
        )}
      </main>
    </div>
  );
}
