import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLogin() {
  const [email, setEmail] = useState('smartcity@osunfa.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password, 'admin');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="glass-card-strong p-8 gradient-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="SmartCity Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-['Bebas_Neue'] text-2xl text-[#ffd700] tracking-wider text-glow-gold">ADMIN PANEL</h1>
              <p className="text-xs text-white/40">League Management System</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ffd700]/50 focus:ring-1 focus:ring-[#ffd700]/20 transition-all"
                placeholder="admin@league.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-[#ffd700]/50 focus:ring-1 focus:ring-[#ffd700]/20 transition-all pr-10"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#ffd700] text-[#0a0e1a] font-semibold rounded-lg hover:bg-[#ffe44d] transition-all disabled:opacity-50 flex items-center justify-center gap-2 glow-gold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Access Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-[#00e676] hover:text-[#00c853] transition-colors"
            >
              Team Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
