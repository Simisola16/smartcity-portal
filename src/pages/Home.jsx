import { useNavigate } from 'react-router-dom';
import {
  Trophy, Shield, Users, Radio, BarChart3, ArrowRight, ChevronDown,
  Star, Zap, Globe, Clock, ClipboardList, Swords
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0e1a]/80 to-[#0a0e1a]" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="SmartCity Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white">SMARTCITY</h1>
              <p className="text-[10px] text-[#00e676] tracking-[0.3em] uppercase -mt-1">Osun Football League</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <span>2024/2025 Season</span>
            <span>Osun State, Nigeria</span>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00e676]/10 border border-[#00e676]/20 text-[#00e676] text-xs font-medium mb-6 animate-fade-in">
            <Radio className="w-3.5 h-3.5 live-pulse" />
            2024/2025 Season Live
          </div>
          <h2 className="font-['Bebas_Neue'] text-6xl md:text-8xl lg:text-9xl text-white leading-none mb-4 animate-slide-up">
            SmartCity
            <br />
            <span className="text-[#00e676] text-glow-green">FOOTBALL LEAGUE</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The premier football competition in Osun State. Professional clubs, live scores, real-time stats, and seamless team management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 bg-[#00e676] text-[#0a0e1a] font-semibold rounded-xl hover:bg-[#00c853] transition-all glow-green"
            >
              <Shield className="w-5 h-5" />
              Team Portal
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              <Zap className="w-5 h-5 text-[#ffd700]" />
              Admin Panel
            </button>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-8 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/30" />
        </div>
      </header>

      {/* Stats Strip */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[ 
            { icon: Users, label: 'Registered Teams', value: '20+' },
            { icon: Swords, label: 'Matches Played', value: '150+' },
            { icon: Globe, label: 'Cities', value: '12' },
            { icon: Star, label: 'Seasons', value: '5' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00e676]/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#00e676]" />
              </div>
              <div>
                <div className="font-['Bebas_Neue'] text-2xl text-white">{stat.value}</div>
                <div className="text-xs text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h3 className="font-['Bebas_Neue'] text-4xl text-white mb-3">PLATFORM FEATURES</h3>
            <p className="text-white/40 max-w-lg mx-auto">Everything teams and administrators need to manage the league professionally.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[ 
              { icon: Radio, title: 'Live Match Center', desc: 'Real-time score updates, match events, and live commentary via Socket.IO' },
              { icon: BarChart3, title: 'Advanced Statistics', desc: 'Comprehensive team and player analytics, top scorers, discipline records' },
              { icon: ClipboardList, title: 'Squad Registration', desc: 'Digital player registration with jersey assignment and captain selection' },
              { icon: Trophy, title: 'League Standings', desc: 'Auto-calculated table with goal difference, points, and form guide' },
              { icon: Clock, title: 'Fixture Management', desc: 'Complete match scheduling with venues, dates, and matchday organization' },
              { icon: Shield, title: 'Team Dashboard', desc: 'Secure login with dedicated squad, fixtures, and stats portal' },
            ].map((feat, i) => (
              <div key={i} className="glass-card p-6 hover:bg-white/[0.08] transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-[#00e676]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6 text-[#00e676]" />
                </div>
                <h4 className="font-['Bebas_Neue'] text-xl text-white mb-2">{feat.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#00e676]" />
            <span className="text-sm text-white/40">SmartCity Osun Football League 2024/2025</span>
          </div>
          <div className="text-sm text-white/30">Powered by SmartCity Sports Technology</div>
        </div>
      </footer>
    </div>
  );
}


