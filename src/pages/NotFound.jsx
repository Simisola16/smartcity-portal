import { Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-[#00e676]/10 flex items-center justify-center mx-auto mb-6 glow-green">
          <AlertTriangle className="w-10 h-10 text-[#00e676]" />
        </div>
        <h1 className="font-['Bebas_Neue'] text-8xl text-white mb-2">404</h1>
        <p className="text-white/40 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00e676] text-[#0a0e1a] font-semibold rounded-lg hover:bg-[#00c853] transition-all"
        >
          <Shield className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    </div>
  );
}
