import React from 'react';
import { 
  MessageSquare, FileText, Network, BarChart3, ShieldCheck, 
  Search, MapPin, UserCheck, ChevronRight, Bookmark
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit';
  setActiveTab: (tab: 'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit') => void;
  officerName: string;
  officerRole: string;
  badgeNumber: string;
  stationName: string;
  selectedStation: string;
  setSelectedStation: (stn: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  officerName,
  officerRole,
  badgeNumber,
  stationName,
  selectedStation,
  setSelectedStation
}) => {
  const navItems = [
    { id: 'chat', label: 'AI Investigation Terminal', icon: MessageSquare, badge: 'Copilot' },
    { id: 'cases', label: 'FIR Investigation Cases', icon: FileText, badge: '600' },
    { id: 'reports', label: 'Reports & Intelligence Briefs', icon: Bookmark, badge: 'PDF' },
    { id: 'graph', label: 'Knowledge Link Graph', icon: Network, badge: 'Cytoscape' },
    { id: 'analytics', label: 'Crime Analytics & Maps', icon: BarChart3, badge: 'Leaflet' },
    { id: 'audit', label: 'SHA-256 Audit Trail', icon: ShieldCheck, badge: 'Verified' },
  ] as const;

  return (
    <aside className="w-64 border-r border-police-border bg-police-card/60 backdrop-blur-md flex flex-col justify-between p-4 z-40 select-none">
      <div className="space-y-6">
        {/* Officer Profile Tactical Badge */}
        <div className="glass-panel p-3.5 rounded-xl border border-police-border/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-police-accent/20 border border-police-highlight/40 flex items-center justify-center text-police-highlight font-bold text-sm">
            {officerName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-xs text-police-text truncate">{officerName}</h3>
            <p className="text-[11px] text-police-gold font-mono">{officerRole}</p>
            <p className="text-[10px] text-police-muted font-mono">{badgeNumber}</p>
          </div>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-police-muted uppercase mb-2">
            INTELLIGENCE NAVIGATION
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-police-accent/20 text-police-highlight border border-police-highlight/40 shadow-lg shadow-police-accent/10 font-semibold'
                    : 'text-police-muted hover:text-police-text hover:bg-police-border/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-police-highlight' : 'text-police-muted'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-police-highlight/20 text-police-highlight' : 'bg-police-border/50 text-police-muted'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Quick Station Filter */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-mono font-semibold tracking-wider text-police-muted uppercase">
            ACTIVE POLICE STATION
          </p>
          <div className="px-3 py-2 bg-police-dark/60 border border-police-border rounded-xl flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-police-gold" />
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="bg-transparent text-police-text font-medium text-xs focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-police-card text-police-text">All Karnataka Stations</option>
              <option value="STN_PEENYA" className="bg-police-card text-police-text">Peenya PS (Bengaluru)</option>
              <option value="STN_KAMAKSHI" className="bg-police-card text-police-text">Kamakshipalya PS</option>
              <option value="STN_DEVARAJA" className="bg-police-card text-police-text">Devaraja PS (Mysuru)</option>
              <option value="STN_PANDESHWAR" className="bg-police-card text-police-text">Pandeshwar PS (Mangaluru)</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Footer Note */}
      <div className="pt-4 border-t border-police-border/60 text-[10px] font-mono text-police-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <UserCheck className="w-3 h-3 text-police-success" />
          SYSTEM SECURE
        </span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};
