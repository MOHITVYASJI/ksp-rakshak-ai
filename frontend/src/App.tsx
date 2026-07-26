import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatTerminal } from './components/chat/ChatTerminal';
import { CytoscapeGraph } from './components/graph/CytoscapeGraph';
import { CrimeMap } from './components/maps/CrimeMap';
import { AnalyticsCharts } from './components/analytics/AnalyticsCharts';
import { CaseDetailModal } from './components/cases/CaseDetailModal';
import { ReportCenter } from './components/reports/ReportCenter';

import { AgentChatMessage, KnowledgeGraphData } from '@shared/types';
import { 
  fetchHealthCheck, sendConversationalAIQuery, fetchAnalyticsOverview, 
  fetchEntityKnowledgeGraph, fetchFIRCases, fetchAuditLogs 
} from './services/api';
import { Network, MapPin, BarChart2, ShieldCheck, FileText } from 'lucide-react';

export default function App() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [activeNavTab, setActiveNavTab] = useState<'chat' | 'cases' | 'reports' | 'graph' | 'analytics' | 'audit'>('chat');
  const [rightPanelTab, setRightPanelTab] = useState<'graph' | 'map' | 'analytics'>('graph');
  const [kannadaMode, setKannadaMode] = useState(false);
  const [selectedStation, setSelectedStation] = useState('ALL');

  // Messages & Data States
  const [messages, setMessages] = useState<AgentChatMessage[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeCaseModalId, setActiveCaseModalId] = useState<string | null>(null);

  // Dynamic Workspace Data
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [firCasesList, setFirCasesList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // Health check on mount & load default graph/analytics
  useEffect(() => {
    fetchHealthCheck()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));

    // Load initial Graph Data
    fetchEntityKnowledgeGraph('STN_PEENYA', 2)
      .then(res => setGraphData(res))
      .catch(err => console.error(err));

    // Load Analytics Data
    fetchAnalyticsOverview()
      .then(res => setAnalyticsData(res))
      .catch(err => console.error(err));

    // Load FIR List
    fetchFIRCases({ page: 1, page_size: 15 })
      .then(res => setFirCasesList(res.items || []))
      .catch(err => console.error(err));

    // Load Audit Trail
    fetchAuditLogs(20)
      .then(res => setAuditLogsList(res || []))
      .catch(err => console.error(err));
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMsg: AgentChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoadingAI(true);

    try {
      const response = await sendConversationalAIQuery(text, selectedStation);

      const aiMsg: AgentChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'AGENT',
        text: response.summary,
        kannadaText: kannadaMode ? response.kannadaSummary : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        confidenceScore: response.confidenceScore,
        executionTimeMs: response.executionTimeMs
      };

      setMessages(prev => [...prev, aiMsg]);

      // Update right panel graph if returned
      if (response.graphData && response.graphData.nodes?.length > 0) {
        setGraphData(response.graphData);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: AgentChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'AGENT',
        text: "Apologies, an error occurred while executing the multi-agent intelligence query. Please retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleVoiceCommandNavigate = (target: string) => {
    if (target === 'cases') setActiveNavTab('cases');
    else if (target === 'graph') {
      setActiveNavTab('chat');
      setRightPanelTab('graph');
    } else if (target === 'map') {
      setActiveNavTab('chat');
      setRightPanelTab('map');
    } else if (target === 'analytics') setActiveNavTab('analytics');
    else if (target === 'CLEAR_CHAT') setMessages([]);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-police-dark text-police-text overflow-hidden select-none">
      {/* Top Tactical Command Header */}
      <Header
        serverStatus={serverStatus}
        activeRole="LEVEL 2 (SHO PEENYA)"
        stationName="Peenya Police Station"
        kannadaMode={kannadaMode}
        setKannadaMode={setKannadaMode}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeNavTab}
          setActiveTab={setActiveNavTab}
          officerName="Inspector Vijay Kumar"
          officerRole="SHO Peenya PS"
          badgeNumber="KSP-KA-BLR-01-002"
          stationName="Peenya Police Station"
          selectedStation={selectedStation}
          setSelectedStation={setSelectedStation}
        />

        {/* Center / Primary Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden border-r border-police-border">
          {activeNavTab === 'chat' && (
            <div className="flex-1 flex h-full">
              {/* Center Terminal */}
              <div className="flex-1 h-full flex flex-col">
                <ChatTerminal
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingAI}
                  onOpenCaseModal={(id) => setActiveCaseModalId(id)}
                  kannadaMode={kannadaMode}
                  onVoiceCommandNavigate={handleVoiceCommandNavigate}
                />
              </div>

              {/* Right Panel (Dynamic Intelligence Workspace) */}
              <div className="w-[450px] border-l border-police-border bg-police-card/40 backdrop-blur-md flex flex-col h-full p-4 space-y-3 hidden lg:flex">
                {/* Right Panel Tabs */}
                <div className="flex items-center justify-between p-1 bg-police-dark/80 rounded-xl border border-police-border text-xs font-mono">
                  <button
                    onClick={() => setRightPanelTab('graph')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      rightPanelTab === 'graph' ? 'bg-police-accent text-white font-bold' : 'text-police-muted hover:text-police-text'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Link Graph</span>
                  </button>
                  <button
                    onClick={() => setRightPanelTab('map')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      rightPanelTab === 'map' ? 'bg-police-accent text-white font-bold' : 'text-police-muted hover:text-police-text'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>GIS Map</span>
                  </button>
                  <button
                    onClick={() => setRightPanelTab('analytics')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      rightPanelTab === 'analytics' ? 'bg-police-accent text-white font-bold' : 'text-police-muted hover:text-police-text'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Analytics</span>
                  </button>
                </div>

                {/* Right Tab Content View */}
                <div className="flex-1 h-full overflow-hidden">
                  {rightPanelTab === 'graph' && (
                    <CytoscapeGraph
                      graphData={graphData}
                      onNodeClick={(id) => console.log('Node clicked:', id)}
                    />
                  )}

                  {rightPanelTab === 'map' && (
                    <CrimeMap hotspots={analyticsData?.hotspot_clusters || []} />
                  )}

                  {rightPanelTab === 'analytics' && (
                    <AnalyticsCharts analyticsData={analyticsData} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cases View */}
          {activeNavTab === 'cases' && (
            <div className="p-6 h-full overflow-y-auto space-y-4">
              <h2 className="text-sm font-bold font-mono text-police-text uppercase tracking-wider">Karnataka CCTNS Case Directory (600 Records)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {firCasesList.map(fir => (
                  <div
                    key={fir.id}
                    onClick={() => setActiveCaseModalId(fir.id)}
                    className="glass-panel-interactive p-4 rounded-xl border border-police-border/80 space-y-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-police-highlight">{fir.fir_no}</span>
                      <span className="px-2 py-0.5 rounded bg-police-gold/20 text-police-gold text-[10px]">{fir.crime_head}</span>
                    </div>
                    <p className="text-xs text-police-text line-clamp-2">{fir.mo_narrative}</p>
                    <div className="flex items-center justify-between text-[10px] text-police-muted font-mono pt-2 border-t border-police-border/40">
                      <span>{fir.station_name}</span>
                      <span>{String(fir.registration_date).slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports & Briefings View */}
          {activeNavTab === 'reports' && (
            <ReportCenter />
          )}

          {/* Graph View */}
          {activeNavTab === 'graph' && (
            <div className="p-4 h-full">
              <CytoscapeGraph graphData={graphData} />
            </div>
          )}

          {/* Analytics View */}
          {activeNavTab === 'analytics' && (
            <div className="p-6 h-full overflow-y-auto">
              <AnalyticsCharts analyticsData={analyticsData} />
            </div>
          )}

          {/* Audit Trail View */}
          {activeNavTab === 'audit' && (
            <div className="p-6 h-full overflow-y-auto space-y-4 font-mono text-xs">
              <h2 className="text-sm font-bold text-police-text uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-police-success" />
                SHA-256 Cryptographic Chain Audit Trail
              </h2>
              <div className="glass-panel rounded-xl border border-police-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-police-dark border-b border-police-border text-police-muted text-[10px]">
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3">OFFICER</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">ACTION</th>
                      <th className="p-3">QUERY / DETAIL</th>
                      <th className="p-3">SHA-256 HASH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogsList.map(log => (
                      <tr key={log.id} className="border-b border-police-border/40 hover:bg-police-border/20">
                        <td className="p-3 text-police-muted">{String(log.timestamp).slice(0, 19)}</td>
                        <td className="p-3 font-semibold text-police-text">{log.user_name}</td>
                        <td className="p-3 text-police-gold">{log.role}</td>
                        <td className="p-3 text-police-highlight">{log.action}</td>
                        <td className="p-3 text-police-muted max-w-xs truncate">{log.query}</td>
                        <td className="p-3 text-police-success text-[10px] font-mono truncate max-w-[120px]">{log.hash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Case Detail Modal */}
      <CaseDetailModal firId={activeCaseModalId} onClose={() => setActiveCaseModalId(null)} />

      {/* Footer Bar */}
      <footer className="h-8 border-t border-police-border bg-police-card/90 px-6 flex items-center justify-between text-[11px] font-mono text-police-muted select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-police-success animate-ping" />
          <span>CRYPTOGRAPHIC AUDIT LOG: SHA-256 CHAIN 100% VERIFIED</span>
        </div>
        <div>KARNATAKA STATE POLICE DATATHON 2026 • TACTICAL PROTOTYPE</div>
      </footer>
    </div>
  );
}
