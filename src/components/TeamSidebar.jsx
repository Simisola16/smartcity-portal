import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, ClipboardList, CalendarDays, Trophy,
  Radio, BarChart3, LogOut, ChevronLeft, ChevronRight, Shield,
  Swords, Activity, Settings, FileCheck, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const teamNavItems = [
  { path: '/team/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/team/squad', label: 'My Squad', icon: Users },
  { path: '/team/registration', label: 'Registration', icon: ClipboardList },
  { path: '/team/fixtures', label: 'Fixtures', icon: CalendarDays },
  { path: '/team/standings', label: 'Standings', icon: Trophy },
  { path: '/team/live', label: 'Live Scores', icon: Radio },
  { path: '/team/stats', label: 'Statistics', icon: BarChart3 },
];

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/matches', label: 'Matches', icon: Swords },
  { path: '/admin/teams', label: 'Teams', icon: Shield },
  { path: '/admin/registrations', label: 'Registrations', icon: FileCheck },
  { path: '/admin/stats', label: 'Statistics', icon: Activity },
];

export function TeamSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-[#070b14] border-r border-white/5 flex flex-col transition-all duration-300 sticky top-0`}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            {user?.badge ? (
              <img src={user.badge} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00e676]/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#00e676]" />
              </div>
            )}
            <span className="font-['Bebas_Neue'] text-lg text-white tracking-wider truncate">{user?.name || 'Team'}</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/60" /> : <ChevronLeft className="w-4 h-4 text-white/60" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {teamNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-[#00e676]/10 text-[#00e676] glow-green'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#00e676]' : 'group-hover:text-white'}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00e676]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} min-h-screen bg-[#070b14] border-r border-white/5 flex flex-col transition-all duration-300 sticky top-0`}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-['Bebas_Neue'] text-lg text-[#ffd700] tracking-wider">ADMIN</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/60" /> : <ChevronLeft className="w-4 h-4 text-white/60" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-[#ffd700]/10 text-[#ffd700] glow-gold'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#ffd700]' : 'group-hover:text-white'}`} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ffd700]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
