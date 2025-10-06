// components/MindMapView.js
import React, { useMemo, useCallback, useEffect } from 'react'; // 👈 1. IMPORT useEffect
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
import { Lightbulb, Download } from 'lucide-react';
import dagre from 'dagre';

// Custom node component (no changes needed here)
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

// Dagre layout function (no changes needed here)
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 220;
  const nodeHeight = 60;

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    
    return node;
  });

  return { nodes: layoutedNodes, edges };
};


export default function MindMapView({ mindMapData }) {
  // `useMemo` still calculates the layout (this is correct)
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!mindMapData?.nodes?.length) {
      return { nodes: [], edges: [] };
    }
    const nodesToLayout = mindMapData.nodes.map(node => ({
      id: node.id,
      type: 'custom',
      data: { 
        label: node.label, 
        level: node.level || 0,
        description: node.description 
      },
      position: { x: 0, y: 0 },
      draggable: true,
    }));
    const edgesToLayout = mindMapData.nodes
      .filter(node => node.parentId)
      .map(node => ({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'smoothstep', // You can also try 'straight' for a classic tree look
        style: { 
          stroke: '#8b5cf6', 
          strokeWidth: 2,
          strokeDasharray: (node.level > 1) ? '5,5' : 'none'
        },
        animated: true,
        markerEnd: {
          type: 'arrowclosed',
          color: '#8b5cf6',
        },
      }));
    
    return getLayoutedElements(nodesToLayout, edgesToLayout, 'TB');
  }, [mindMapData]);

  // We initialize state with an empty array or the initial layout
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // 👇 2. THE FIX: A useEffect HOOK TO SYNC THE STATE
  // This effect runs whenever the layout calculation finishes (i.e., when
  // layoutedNodes or layoutedEdges changes). It tells React Flow to
  // use the new nodes and edges, triggering a re-render with correct positions.
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);


  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // ... The rest of your component remains exactly the same
  const exportAsImage = useCallback(() => {
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
      
      {/* Mind Map Canvas */}
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
            padding: 0.1,
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