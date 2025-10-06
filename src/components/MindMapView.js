// components/MindMapView.js - ADVANCED NO OVERLAPPING VERSION
import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Lightbulb, Download, ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';

export default function MindMapView({ mindMapData }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

  const filterToImportantNodes = useCallback((nodes, maxNodes = 25) => {
    if (!nodes?.length) return [];

    const scoredNodes = nodes.map(node => {
      let score = 0;
      if (node.level === 0) score += 1000;
      else if (node.level === 1) score += 100;
      else if (node.level === 2) score += 10;
      
      const childCount = nodes.filter(n => n.parentId === node.id).length;
      score += childCount * 5;
      
      return { ...node, score };
    });

    const topNodes = scoredNodes
      .sort((a, b) => b.score - a.score)
      .slice(0, maxNodes);

    const selectedIds = new Set(topNodes.map(n => n.id));
    const withParents = [...topNodes];

    topNodes.forEach(node => {
      let current = node;
      while (current.parentId) {
        if (!selectedIds.has(current.parentId)) {
          const parent = nodes.find(n => n.id === current.parentId);
          if (parent) {
            withParents.push(parent);
            selectedIds.add(parent.id);
          }
        }
        current = nodes.find(n => n.id === current.parentId);
        if (!current) break;
      }
    });

    return withParents;
  }, []);

  useEffect(() => {
    if (!mindMapData?.nodes?.length || !svgRef.current) return;

    const filteredNodes = filterToImportantNodes(mindMapData.nodes, 25);
    d3.select(svgRef.current).selectAll('*').remove();

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');

    // Enhanced gradients with multiple stops
    const purpleGradient = defs.append('linearGradient')
      .attr('id', 'purpleGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    purpleGradient.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7');
    purpleGradient.append('stop').attr('offset', '50%').attr('stop-color', '#9333ea');
    purpleGradient.append('stop').attr('offset', '100%').attr('stop-color', '#ec4899');

    const blueGradient = defs.append('linearGradient')
      .attr('id', 'blueGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    blueGradient.append('stop').attr('offset', '0%').attr('stop-color', '#60a5fa');
    blueGradient.append('stop').attr('offset', '50%').attr('stop-color', '#3b82f6');
    blueGradient.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4');

    const greenGradient = defs.append('linearGradient')
      .attr('id', 'greenGradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '100%');
    greenGradient.append('stop').attr('offset', '0%').attr('stop-color', '#34d399');
    greenGradient.append('stop').attr('offset', '50%').attr('stop-color', '#10b981');
    greenGradient.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Enhanced glow filter
    const glowFilter = defs.append('filter').attr('id', 'glow');
    glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Stronger glow for root
    const strongGlow = defs.append('filter').attr('id', 'strongGlow');
    strongGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
    const strongMerge = strongGlow.append('feMerge');
    strongMerge.append('feMergeNode').attr('in', 'coloredBlur');
    strongMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const zoomBehavior = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    const g = svg.append('g');

    const stratify = d3.stratify()
      .id(d => d.id)
      .parentId(d => d.parentId);

    const root = stratify(filteredNodes);

    // ADVANCED TREE LAYOUT - NO OVERLAPPING
    const treeLayout = d3.tree()
      .size([width - 100, height - 80])
      .separation((a, b) => {
        // Root level - maximum separation
        if (a.depth === 0 || b.depth === 0) return 6;
        
        // Same parent - moderate separation based on depth
        if (a.parent === b.parent) {
          if (a.depth === 1) return 2.8;
          if (a.depth === 2) return 2.5;
          if (a.depth === 3) return 2.3;
          if (a.depth >= 4) return 2.2;
          return 2.5;
        }
        
        // Different parents - larger separation
        if (a.depth === 1 && b.depth === 1) return 4.0;
        if (a.depth === 2 && b.depth === 2) return 3.5;
        if (a.depth === 3 && b.depth === 3) return 3.2;
        if (a.depth >= 4 && b.depth >= 4) return 3.0;
        
        return 3.5;
      });

    treeLayout(root);

    // OPTIMIZED NODE STYLES
    const getNodeStyle = (d) => {
      const depth = d.depth;
      if (depth === 0) return {
        gradient: 'url(#purpleGradient)',
        border: '#c084fc',
        text: '#ffffff',
        width: 240,
        height: 75,
        fontSize: '16px',
        filter: 'url(#strongGlow)'
      };
      if (depth === 1) return {
        gradient: 'url(#blueGradient)',
        border: '#93c5fd',
        text: '#ffffff',
        width: 170,
        height: 58,
        fontSize: '13px',
        filter: 'url(#glow)'
      };
      return {
        gradient: 'url(#greenGradient)',
        border: '#6ee7b7',
        text: '#ffffff',
        width: 150,
        height: 50,
        fontSize: '12px',
        filter: 'url(#glow)'
      };
    };

    // Draw enhanced links
    const linkGroup = g.append('g').attr('class', 'links');

    linkGroup.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', link => {
        return d3.linkVertical()
          .x(d => d.x)
          .y(d => d.y)(link);
      })
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.target.depth === 1) return '#a78bfa';
        if (d.target.depth === 2) return '#60a5fa';
        if (d.target.depth === 3) return '#34d399';
        return '#22d3ee';
      })
      .attr('stroke-width', d => {
        if (d.target.depth === 1) return 3.5;
        if (d.target.depth === 2) return 2.5;
        return 2;
      })
      .attr('stroke-dasharray', d => d.target.depth > 1 ? '8,4' : '0')
      .attr('opacity', 0)
      .transition()
      .duration(1200)
      .delay((d, i) => i * 25)
      .attr('opacity', d => d.target.depth === 1 ? 0.8 : 0.6);

    // Draw nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodes = nodeGroup.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('opacity', 0)
      .style('cursor', 'pointer');

    // Enhanced node backgrounds
    nodes.append('rect')
      .attr('class', 'node-bg')
      .attr('width', d => getNodeStyle(d).width)
      .attr('height', d => getNodeStyle(d).height)
      .attr('x', d => -getNodeStyle(d).width / 2)
      .attr('y', d => -getNodeStyle(d).height / 2)
      .attr('rx', 14)
      .attr('ry', 14)
      .attr('fill', d => getNodeStyle(d).gradient)
      .attr('stroke', d => getNodeStyle(d).border)
      .attr('stroke-width', d => d.depth === 0 ? 4 : 3)
      .style('filter', d => getNodeStyle(d).filter)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', d.depth === 0 ? 6 : 5)
          .attr('rx', 16)
          .attr('ry', 16)
          .style('filter', 'url(#strongGlow)');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', d.depth === 0 ? 4 : 3)
          .attr('rx', 14)
          .attr('ry', 14)
          .style('filter', getNodeStyle(d).filter);
      });

    // Word wrap text with better spacing
    nodes.each(function(d) {
      const node = d3.select(this);
      const style = getNodeStyle(d);
      const text = d.data.label || '';
      
      const words = text.split(/\s+/);
      const maxWidth = style.width - 24;
      const lineHeight = d.depth === 0 ? 18 : 15;
      const lines = [];
      let currentLine = [];
      
      const testText = node.append('text')
        .attr('opacity', 0)
        .attr('font-size', style.fontSize);
      
      words.forEach(word => {
        currentLine.push(word);
        testText.text(currentLine.join(' '));
        if (testText.node().getComputedTextLength() > maxWidth) {
          currentLine.pop();
          if (currentLine.length > 0) {
            lines.push(currentLine.join(' '));
          }
          currentLine = [word];
        }
      });
      if (currentLine.length > 0) {
        lines.push(currentLine.join(' '));
      }
      testText.remove();
      
      const maxLines = d.depth === 0 ? 2 : 3;
      const displayLines = lines.slice(0, maxLines);
      if (lines.length > maxLines) {
        displayLines[maxLines - 1] = displayLines[maxLines - 1].substring(0, 16) + '...';
      }
      
      const startY = -(displayLines.length - 1) * lineHeight / 2;
      displayLines.forEach((line, i) => {
        node.append('text')
          .attr('dy', startY + (i * lineHeight))
          .attr('text-anchor', 'middle')
          .attr('fill', style.text)
          .attr('font-size', style.fontSize)
          .attr('font-weight', d.depth === 0 ? 'bold' : d.depth === 1 ? '600' : '500')
          .style('pointer-events', 'none')
          .style('text-shadow', '0 2px 4px rgba(0,0,0,0.3)')
          .text(line);
      });
    });

    // Staggered animation
    nodes.transition()
      .duration(900)
      .delay((d, i) => i * 60 + 400)
      .style('opacity', 1);

    // Smart auto-fit with padding
    setTimeout(() => {
      const bounds = g.node().getBBox();
      const fullWidth = bounds.width;
      const fullHeight = bounds.height;
      const midX = bounds.x + fullWidth / 2;
      const midY = bounds.y + fullHeight / 2;

      if (fullWidth && fullHeight) {
        const scale = 0.92 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [
          width / 2 - scale * midX,
          height / 2 - scale * midY
        ];

        svg.transition()
          .duration(1200)
          .ease(d3.easeCubicOut)
          .call(
            zoomBehavior.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
          );
      }
    }, 1800);

  }, [mindMapData, filterToImportantNodes]);

  const handleZoomIn = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .call(zoomRef.current.scaleBy, 1.4);
    }
  };

  const handleZoomOut = () => {
    if (zoomRef.current && svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(400)
        .ease(d3.easeCubicOut)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (zoomRef.current && svgRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      d3.select(svgRef.current)
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .call(
          zoomRef.current.transform,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
        );
    }
  };

  const exportAsImage = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    svgString = svgString.replace('<svg', '<svg style="background: #0f0f23;"');
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mindMapData.title || 'mindmap'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!mindMapData?.nodes?.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-purple-500/20">
        <div className="text-center p-8">
          <Lightbulb className="mx-auto w-24 h-24 mb-6 text-purple-400 opacity-40 animate-pulse" />
          <p className="text-2xl font-semibold text-gray-200 mb-3">No mind map data available</p>
          <p className="text-sm text-gray-500">Generate content to visualize your learning path</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[950px] w-full bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-500/20">
      {/* Enhanced Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/50">
              <Lightbulb size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                {mindMapData.title}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                  <Filter size={14} />
                  Top 25 concepts
                </span>
                <span className="text-purple-400">•</span>
                <span className="text-gray-400 font-medium">{mindMapData.nodes?.length || 0} total nodes</span>
              </div>
            </div>
          </div>
          <button
            onClick={exportAsImage}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-105 active:scale-95"
          >
            <Download size={18} />
            Export SVG
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative" style={{ width: '100%', height: 'calc(100% - 160px)' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
          onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
          onMouseLeave={(e) => e.currentTarget.style.cursor = 'grab'}
        />

        {/* Enhanced Floating Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-gradient-to-br from-black/90 to-purple-900/80 backdrop-blur-xl p-3 rounded-2xl border border-purple-500/40 shadow-2xl">
          <button onClick={handleZoomIn} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all duration-200 group" title="Zoom In">
            <ZoomIn size={22} className="text-purple-200 group-hover:text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <button onClick={handleZoomOut} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all duration-200 group" title="Zoom Out">
            <ZoomOut size={22} className="text-purple-200 group-hover:text-white group-hover:scale-110 transition-transform" />
          </button>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <button onClick={handleReset} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all duration-200 group" title="Reset View">
            <Maximize2 size={22} className="text-purple-200 group-hover:text-white group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="px-6 py-5 bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 backdrop-blur-md border-t border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 border-2 border-purple-300 shadow-lg shadow-purple-500/60" />
              <span className="text-sm text-gray-200 font-semibold">Main Topic</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 border-2 border-blue-300 shadow-lg shadow-blue-500/60" />
              <span className="text-sm text-gray-200 font-semibold">Subtopics</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-400 via-green-500 to-emerald-500 border-2 border-green-300 shadow-lg shadow-green-500/60" />
              <span className="text-sm text-gray-200 font-semibold">Details</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 italic font-medium">
            Scroll to zoom • Drag to pan • Hover for interaction
          </div>
        </div>
      </div>
    </div>
  );
}
