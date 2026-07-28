import { Home, Clock, Settings, FileAudio } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 h-full glass border-r border-white/10 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          <FileAudio className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Whisper GUI
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon={<Home className="w-5 h-5" />} label="Home" active />
        <NavItem icon={<Clock className="w-5 h-5" />} label="History" />
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="text-xs text-slate-400 flex flex-col gap-1">
          <span>Local Engine: whisper.cpp</span>
          <span>Model: ggml-base.en.bin</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-indigo-500/10 text-indigo-300 font-medium' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
