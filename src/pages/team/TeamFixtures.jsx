import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Shield, Loader2, Radio
} from 'lucide-react';
import { TeamSidebar } from '../../components/TeamSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { format } from 'date-fns';

export default function TeamFixtures() {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      const res = await api.get(`/api/matches?teamId=${user._id}`);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      scheduled: 'bg-white/10 text-white/60',
      live: 'bg-red-500/20 text-red-400 live-pulse',
      halftime: 'bg-[#ffd700]/20 text-[#ffd700]',
      completed: 'bg-[#00e676]/10 text-[#00e676]',
      postponed: 'bg-red-500/10 text-red-400'
    };
    return styles[status] || styles.scheduled;
  };

  const isMyTeam = (match, home) => {
    return (home ? match.homeTeam?._id : match.awayTeam?._id) === user?._id;
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
          <h1 className="font-['Bebas_Neue'] text-4xl text-white mb-1">FIXTURES & RESULTS</h1>
          <p className="text-white/40">All matches involving your team</p>
        </header>

        <div className="space-y-4">
          {matches.map((match, i) => {
            const isHome = isMyTeam(match, true);
            const opponent = isHome ? match.awayTeam : match.homeTeam;
            const myScore = isHome ? match.homeScore : match.awayScore;
            const oppScore = isHome ? match.awayScore : match.homeScore;
            return (
              <div key={match._id} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  {/* Date */}
                  <div className="text-center min-w-[80px]">
                    <div className="font-['Bebas_Neue'] text-2xl text-[#00e676]">{format(new Date(match.date), 'dd')}</div>
                    <div className="text-xs text-white/40 uppercase">{format(new Date(match.date), 'MMM')}</div>
                  </div>

                  {/* Teams */}
                  <div className="flex-1 flex items-center justify-center gap-4">
                    <div className={`text-center ${isHome ? 'order-1' : 'order-3'}`}>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1">
                        <Shield className="w-6 h-6 text-[#00e676]" />
                      </div>
                      <p className="text-sm font-medium text-white">{isHome ? match.homeTeam?.name : match.awayTeam?.name}</p>
                    </div>

                    <div className="order-2 px-6 py-2 bg-white/5 rounded-xl min-w-[120px] text-center">
                      {match.status === 'scheduled' ? (
                        <span className="font-['Bebas_Neue'] text-xl text-white/30">VS</span>
                      ) : (
                        <div className="font-['Bebas_Neue'] text-3xl text-white">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      )}
                    </div>

                    <div className={`text-center ${isHome ? 'order-3' : 'order-1'}`}>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1">
                        <Shield className="w-6 h-6 text-[#ffd700]" />
                      </div>
                      <p className="text-sm font-medium text-white">{opponent?.name}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-white/40 min-w-[180px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {match.venue || 'TBD'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(match.date), 'HH:mm')}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${statusBadge(match.status)}`}>
                    {match.status === 'live' && <Radio className="w-3 h-3 inline mr-1" />}
                    {match.status}
                  </div>
                </div>

                {match.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-center text-sm">
                    <span className={myScore > oppScore ? 'text-[#00e676]' : myScore < oppScore ? 'text-red-400' : 'text-[#ffd700]'}>
                      {myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D'}
                    </span>
                    <span className="text-white/30 ml-2">Matchday {match.matchday}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30">No fixtures found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
