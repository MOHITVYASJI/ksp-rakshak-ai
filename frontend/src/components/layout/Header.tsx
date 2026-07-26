import React from 'react';
import { Shield, Lock, Server, Bell, Mic, Volume2 } from 'lucide-react';

interface HeaderProps {
  serverStatus: 'online' | 'offline' | 'checking';
  activeRole: string;
  stationName: string;
  kannadaMode: boolean;
  setKannadaMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  serverStatus,
  activeRole,
  stationName,
  kannadaMode,
  setKannadaMode
}) => {
  return (
    <header className="h-14 border-b border-police-border bg-police-card/90 backdrop-blur-md px-6 flex items-center justify-between z-50 select-none">
      {/* Brand & Badge */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-police-accent/20 border border-police-highlight/40 rounded-xl shadow-lg shadow-police-accent/10">
          <Shield className="w-5 h-5 text-police-highlight" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-wider uppercase text-police-text">
              KSP RAKSHAK-AI
            </h1>
            <span className="px-2 py-0.5 text-[10px] bg-police-gold/20 text-police-gold border border-police-gold/40 rounded font-mono font-semibold">
              DATATHON 2026
            </span>
          </div>
          <p className="text-[11px] text-police-muted">
            Karnataka State Police • Tactical Crime Intelligence Command Center
          </p>
        </div>
      </div>

      {/* Middle Controls & Vernacular Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setKannadaMode(!kannadaMode)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
            kannadaMode
              ? 'bg-police-gold/20 border-police-gold text-police-gold shadow-md shadow-police-gold/10'
              : 'bg-police-dark/60 border-police-border text-police-muted hover:text-police-text'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{kannadaMode ? 'ಕನ್ನಡ VOICE & TEXT ACTIVE' : 'ENGLISH / KANNADA'}</span>
        </button>
      </div>

      {/* Status Bar Pills */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-police-dark/70 border border-police-border rounded-full">
          <Server className="w-3.5 h-3.5 text-police-muted" />
          <span className="text-police-muted">Engine:</span>
          <span className={serverStatus === 'online' ? 'text-police-success font-semibold' : 'text-police-gold font-semibold'}>
            {serverStatus.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-police-dark/70 border border-police-border rounded-full">
          <Lock className="w-3.5 h-3.5 text-police-gold" />
          <span className="text-police-muted">CLEARANCE:</span>
          <span className="text-police-highlight font-semibold">{activeRole} ({stationName})</span>
        </div>

        <button className="p-2 bg-police-border/40 hover:bg-police-border border border-police-border rounded-lg text-police-muted hover:text-police-text transition">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
