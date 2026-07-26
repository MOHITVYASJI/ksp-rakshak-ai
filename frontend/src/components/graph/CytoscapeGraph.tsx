import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { KnowledgeGraphData } from '@shared/types';
import { ZoomIn, ZoomOut, RefreshCw, Layers } from 'lucide-react';

interface CytoscapeGraphProps {
  graphData: KnowledgeGraphData;
  onNodeClick?: (nodeId: string) => void;
}

export const CytoscapeGraph: React.FC<CytoscapeGraphProps> = ({ graphData, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current || !graphData.nodes.length) return;

    const elements = [
      ...graphData.nodes.map(n => ({
        data: {
          id: n.id,
          label: n.label,
          type: n.type
        }
      })),
      ...graphData.edges.map(e => ({
        data: {
          source: e.source,
          target: e.target,
          label: e.label
        }
      }))
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#F3F4F6',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 4,
            'background-color': '#3B82F6',
            'width': 36,
            'height': 36,
            'border-width': 2,
            'border-color': '#1E40AF'
          }
        },
        {
          selector: 'node[type = "ACCUSED"]',
          style: {
            'background-color': '#EF4444',
            'border-color': '#991B1B'
          }
        },
        {
          selector: 'node[type = "GANG"]',
          style: {
            'background-color': '#D97706',
            'border-color': '#92400E',
            'width': 44,
            'height': 44
          }
        },
        {
          selector: 'node[type = "VEHICLE"]',
          style: {
            'background-color': '#10B981',
            'border-color': '#065F46'
          }
        },
        {
          selector: 'node[type = "DIGITAL_EVIDENCE"]',
          style: {
            'background-color': '#8B5CF6',
            'border-color': '#5B21B6'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#374151',
            'target-arrow-color': '#374151',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#9CA3AF',
            'text-rotation': 'autorotate'
          }
        }
      ],
      layout: {
        name: 'concentric',
        concentric: function (node: any) { return node.data('type') === 'ACCUSED' ? 2 : 1; },
        levelWidth: function () { return 1; },
        padding: 30
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if (onNodeClick) onNodeClick(node.id());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <div className="relative w-full h-full bg-police-dark border border-police-border rounded-xl overflow-hidden">
      {/* Control Buttons Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 glass-panel p-1.5 rounded-lg border border-police-border">
        <button onClick={handleZoomIn} className="p-1.5 hover:bg-police-border rounded text-police-muted hover:text-police-text">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-1.5 hover:bg-police-border rounded text-police-muted hover:text-police-text">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleFit} className="p-1.5 hover:bg-police-border rounded text-police-muted hover:text-police-text">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Node Legend */}
      <div className="absolute bottom-3 left-3 z-10 glass-panel p-2.5 rounded-lg border border-police-border text-[10px] font-mono space-y-1">
        <div className="text-police-muted font-bold uppercase mb-1">Entity Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-police-text">Accused</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-police-text">Gang Syndicate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-police-text">FIR Case</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-police-text">Vehicle</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-police-text">Phone / IMEI / UPI</span>
        </div>
      </div>

      {/* Cytoscape Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
