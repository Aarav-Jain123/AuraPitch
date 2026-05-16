import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center transform rotate-12">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-950 dark:text-white">Aura<span className="text-rose-600">Pitch</span></span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-sm font-black text-slate-950 dark:text-slate-400 hover:text-rose-600 transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link 
              to="/new-session" 
              className="px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              New Practice
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
