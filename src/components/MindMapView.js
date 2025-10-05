// components/MindMapView.js
import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Lightbulb, Download, ZoomIn } from 'lucide-react';

const nodeTypes = {
  custom: ({ data }) => (
    <div className={`px-4 py-2 rounded-lg border-2 text-center shadow-lg transition-all hover:scale-105 ${
      data.level === 0 
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white font-bold text-lg min-w-[200px] shadow-purple-500/30'
        : data.level === 1
        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-300 text-white font-semibold min-w-[150px] shadow-blue-500/30'
        : 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-300 text-white min-w-[120px] shadow-green-500/30'
    }`}>
      <div className="font-medium">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 opacity-80 italic">{data.description}</div>
      )}
    </div>
  ),
};

export default function MindMapView({ mindMapData }) {
  const initialNodes = useMemo(() => {
    if (!mindMapData?.nodes) return [];
    
    return mindMapData.nodes.map((node, index) => {
      const level = node.level || 0;
      let x, y;
      
      // Position nodes in a hierarchical layout
      if (level === 0) {
        // Root node at center
        x = 400;
        y = 200;
      } else if (level === 1) {
        // First level nodes in a circle around root
        const level1Nodes = mindMapData.nodes.filter(n => n.level === 1);
        const angle = (level1Nodes.indexOf(node) * 2 * Math.PI) / level1Nodes.length;
        x = 400 + Math.cos(angle) * 250;
        y = 200 + Math.sin(angle) * 250;
      } else {
        // Second level nodes positioned around their parents
        const parentNode = mindMapData.nodes.find(n => n.id === node.parentId);
        if (parentNode) {
          const level1Nodes = mindMapData.nodes.filter(n => n.level === 1);
          const parentIndex = level1Nodes.indexOf(parentNode);
          const parentAngle = (parentIndex * 2 * Math.PI) / level1Nodes.length;
          
          const siblingNodes = mindMapData.nodes.filter(n => n.parentId === node.parentId && n.level === level);
          const siblingIndex = siblingNodes.indexOf(node);
          const siblingOffset = (siblingIndex - (siblingNodes.length - 1) / 2) * 0.3;
          
          x = 400 + Math.cos(parentAngle + siblingOffset) * 400;
          y = 200 + Math.sin(parentAngle + siblingOffset) * 400;
        } else {
          x = 400 + (Math.random() - 0.5) * 600;
          y = 200 + (Math.random() - 0.5) * 400;
        }
      }
      
      return {
        id: node.id,
        type: 'custom',
        position: { x, y },
        data: { 
          label: node.label, 
          level: level,
          description: node.description 
        },
        draggable: true,
      };
    });
  }, [mindMapData]);

  const initialEdges = useMemo(() => {
    if (!mindMapData?.nodes) return [];
    
    return mindMapData.nodes
      .filter(node => node.parentId)
      .map(node => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'smoothstep',
        style: { 
          stroke: '#8b5cf6', 
          strokeWidth: 2,
          strokeDasharray: node.level > 1 ? '5,5' : 'none'
        },
        animated: true,
        markerEnd: {
          type: 'arrowclosed',
          color: '#8b5cf6',
        },
      }));
  }, [mindMapData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const exportAsImage = useCallback(() => {
    // This would require additional setup for image export
    // For now, we'll show an alert
    alert('Image export feature will be implemented in a future update!');
  }, []);

  if (!mindMapData) {
    return (
      <div className="p-8 text-center text-gray-400">
        <Lightbulb className="mx-auto w-16 h-16 mb-4 opacity-50" />
        <p>No mind map data available.</p>
        <p className="text-sm mt-2">Generate a mind map from your content to see it here.</p>
      </div>
    );
  }

  return (
    <div className="h-[700px] w-full bg-black/20">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/30">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Lightbulb size={24} className="text-yellow-400" />
              {mindMapData.title}
            </h2>
            <p className="text-gray-300 text-sm">
              Explore concepts and their relationships • {mindMapData.nodes?.length || 0} nodes
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportAsImage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Mind Map */}
      <div style={{ width: '100%', height: '650px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          attributionPosition="bottom-left"
          style={{
            background: 'transparent',
          }}
        >
          <Controls 
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
          />
          <MiniMap 
            style={{
              height: 120,
              width: 200,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
            zoomable
            pannable
            nodeColor={(node) => {
              switch (node.data.level) {
                case 0: return '#8b5cf6';
                case 1: return '#3b82f6';
                default: return '#10b981';
              }
            }}
          />
          <Background 
            color="#374151" 
            gap={20} 
            style={{ opacity: 0.5 }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="p-4 bg-black/30 border-t border-white/10">
        <h3 className="text-sm font-semibold text-white mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded border border-purple-400"></div>
            <span className="text-gray-300">Main Topic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded border border-blue-300"></div>
            <span className="text-gray-300">Subtopics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded border border-green-300"></div>
            <span className="text-gray-300">Details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
