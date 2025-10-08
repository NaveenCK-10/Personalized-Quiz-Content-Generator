// components/MindMapView.js - ULTIMATE VISUAL ENHANCEMENT VERSION
import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { Lightbulb, Download, ZoomIn, ZoomOut, Maximize2, Filter, Sparkles } from 'lucide-react';

export default function MindMapView({ mindMapData }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  const filterToImportantNodes = useCallback((nodes, maxNodes = 25) => {
    if (!nodes?.length) return [];

    const scoredNodes = nodes.map(node => {
      let score = 0;
      if (node.priority) {
        score = node.priority * 200;
      } else {
        if (node.level === 0) score += 1000;
        else if (node.level === 1) score += 100;
        else if (node.level === 2) score += 10;
      }

      const childCount = nodes.filter(n => n.parentId === node.id).length;
      score += childCount * 5;

      return { ...node, score };
    });

    const topNodes = scoredNodes.sort((a, b) => b.score - a.score).slice(0, maxNodes);
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

    const finalNodes = withParents.filter(node => {
      if (!node.parentId || node.parentId === '' || node.level === 0) return true;
      return selectedIds.has(node.parentId);
    });

    const rootNodes = finalNodes.filter(n => !n.parentId || n.parentId === '' || n.level === 0);
    
    if (rootNodes.length === 0) return [];
    
    if (rootNodes.length > 1) {
      const mainRoot = rootNodes[0];
      const validIds = new Set([mainRoot.id]);
      
      const addChildren = (parentId) => {
        finalNodes.forEach(node => {
          if (node.parentId === parentId && !validIds.has(node.id)) {
            validIds.add(node.id);
            addChildren(node.id);
          }
        });
      };
      
      addChildren(mainRoot.id);
      return finalNodes.filter(n => validIds.has(n.id));
    }

    return finalNodes;
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
    
    // Background grid
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 40)
      .attr('height', 40)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 40 0 L 0 0 0 40')
      .attr('fill', 'none')
      .attr('stroke', '#2a2a3d')
      .attr('stroke-width', 0.8);

    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#grid)');

    // Gradients
    const gradients = {
      purple: ['#a855f7', '#9333ea', '#ec4899'],
      blue: ['#60a5fa', '#3b82f6', '#06b6d4'],
      green: ['#34d399', '#10b981', '#059669'],
      gold: ['#fbbf24', '#f59e0b', '#d97706'],
    };

    Object.entries(gradients).forEach(([id, colors]) => {
      const grad = defs.append('linearGradient')
        .attr('id', `${id}Gradient`)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '100%');

      grad.selectAll('stop')
        .data(colors)
        .enter()
        .append('stop')
        .attr('offset', (d, i) => `${(i / (colors.length - 1)) * 100}%`)
        .attr('stop-color', d => d);
    });

    // Filters
    const glow = defs.append('filter').attr('id', 'glow');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    const strongGlow = defs.append('filter').attr('id', 'strongGlow');
    strongGlow.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'blur');
    const merge2 = strongGlow.append('feMerge');
    merge2.append('feMergeNode').attr('in', 'blur');
    merge2.append('feMergeNode').attr('in', 'SourceGraphic');

    const extremeGlow = defs.append('filter').attr('id', 'extremeGlow');
    extremeGlow.append('feGaussianBlur').attr('stdDeviation', '8').attr('result', 'blur');
    const merge3 = extremeGlow.append('feMerge');
    merge3.append('feMergeNode').attr('in', 'blur');
    merge3.append('feMergeNode').attr('in', 'SourceGraphic');

    const zoomBehavior = d3.zoom()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    const g = svg.append('g');

    const stratify = d3.stratify().id(d => d.id).parentId(d => d.parentId);
    const root = stratify(filteredNodes);

    let horizontal = width > height * 1.3;
    if (root.height > 5 && horizontal) {
      horizontal = false;
    }

    const treeLayout = d3.tree()
      .size(horizontal ? [height - 80, width - 100] : [width - 100, height - 80])
      .separation((a, b) => {
        const labelLen = Math.max(a.data.label?.length || 0, b.data.label?.length || 0);
        const depthFactor = a.parent === b.parent ? 1.8 : 2.8;
        return Math.min(12, depthFactor + labelLen / 12);
      });

    treeLayout(root);

    const linkGenerator = horizontal ? d3.linkHorizontal() : d3.linkVertical();

    const getNodeStyle = (d) => {
      const priority = d.data.priority || 3;
      const len = d.data.label?.length || 0;
      const baseWidth = Math.min(260, 120 + len * 5);
      const baseHeight = d.depth === 0 ? 75 : d.depth === 1 ? 60 : 50;
      const fontSize = d.depth === 0 ? '16px' : d.depth === 1 ? '13px' : '12px';

      if (priority === 5) {
        return {
          width: baseWidth,
          height: baseHeight + 5,
          gradient: 'url(#goldGradient)',
          border: '#fbbf24',
          fontSize,
          filter: 'url(#extremeGlow)',
        };
      }

      const gradient = d.depth === 0 ? 'url(#purpleGradient)' 
        : d.depth === 1 ? 'url(#blueGradient)' 
        : 'url(#greenGradient)';
      
      const border = d.depth === 0 ? '#c084fc' 
        : d.depth === 1 ? '#93c5fd' 
        : '#6ee7b7';

      const filter = priority >= 4 ? 'url(#strongGlow)' : 'url(#glow)';

      return { width: baseWidth, height: baseHeight, gradient, border, fontSize, filter };
    };

    // Links
    g.append('g')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('d', link =>
        linkGenerator({
          source: horizontal ? [link.source.y, link.source.x] : [link.source.x, link.source.y],
          target: horizontal ? [link.target.y, link.target.x] : [link.target.x, link.target.y],
        })
      )
      .attr('fill', 'none')
      .attr('stroke', d => {
        const priority = d.target.data.priority || 3;
        if (priority === 5) return '#fbbf24';
        return '#6666aa';
      })
      .attr('stroke-width', d => {
        const priority = d.target.data.priority || 3;
        return priority === 5 ? 3.5 : 2;
      })
      .attr('opacity', 0.6);

    // Nodes
    // Nodes - FIXED: Remove depth offset to align with links
  const node = g
    .selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d =>
      horizontal
        ? `translate(${d.y},${d.x})`  // ✅ REMOVED + d.depth * 25
        : `translate(${d.x},${d.y})`   // ✅ REMOVED + d.depth * 25
    );

    // Priority badge
    node.filter(d => d.data.priority === 5)
      .append('circle')
      .attr('cx', d => getNodeStyle(d).width / 2 - 12)
      .attr('cy', d => -getNodeStyle(d).height / 2 + 12)
      .attr('r', 8)
      .attr('fill', '#fbbf24')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    node.filter(d => d.data.priority === 5)
      .append('text')
      .attr('x', d => getNodeStyle(d).width / 2 - 12)
      .attr('y', d => -getNodeStyle(d).height / 2 + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('★');

    node
      .append('rect')
      .attr('x', d => -getNodeStyle(d).width / 2)
      .attr('y', d => -getNodeStyle(d).height / 2)
      .attr('width', d => getNodeStyle(d).width)
      .attr('height', d => getNodeStyle(d).height)
      .attr('rx', 14)
      .attr('fill', d => getNodeStyle(d).gradient)
      .attr('stroke', d => getNodeStyle(d).border)
      .attr('stroke-width', d => d.data.priority === 5 ? 4 : 3)
      .style('filter', d => getNodeStyle(d).filter)
      .style('transition', 'all 0.3s ease')
      // 🌀 ENHANCEMENT 1: Subtle pulse glow for purple nodes
      .style('animation', d => d.depth === 0 ? 'pulse-glow 2.5s infinite alternate' : 'none')
      // 🎯 ENHANCEMENT 2: Focus effect on click
      .on('click', function (event, d) {
        event.stopPropagation();
        d3.selectAll('.node rect')
          .transition()
          .duration(300)
          .style('opacity', 0.3);
        d3.select(this)
          .transition()
          .duration(300)
          .style('opacity', 1);
      })
      // 💡 ENHANCEMENT 3: Tooltip on hover
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', 5)
          .style('filter', 'url(#extremeGlow)');

        // Show tooltip
        const priority = d.data.priority || 'N/A';
        const childCount = filteredNodes.filter(n => n.parentId === d.data.id).length;
        setTooltip({
          show: true,
          x: event.pageX + 15,
          y: event.pageY - 10,
          content: `
            <div style="font-weight: bold; margin-bottom: 6px;">${d.data.label}</div>
            <div style="font-size: 12px; color: #d1d5db;">
              Level: ${d.depth}<br/>
              Priority: ${priority}<br/>
              Children: ${childCount}
            </div>
          `
        });
      })
      .on('mouseout', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('stroke-width', d.data.priority === 5 ? 4 : 3)
          .style('filter', getNodeStyle(d).filter);

        // Hide tooltip
        setTooltip({ show: false, x: 0, y: 0, content: '' });
      })
      .on('mousemove', (event) => {
        setTooltip(prev => ({
          ...prev,
          x: event.pageX + 15,
          y: event.pageY - 10
        }));
      });

    // Click anywhere to reset focus
    svg.on('click', function () {
      d3.selectAll('.node rect')
        .transition()
        .duration(300)
        .style('opacity', 1);
    });

    // Text
    node.each(function (d) {
      const nodeSel = d3.select(this);
      const style = getNodeStyle(d);
      const words = d.data.label.split(/\s+/);
      const lineHeight = 15;
      const maxWidth = style.width - 20;
      const lines = [];
      let line = [];

      const temp = nodeSel.append('text').attr('opacity', 0).attr('font-size', style.fontSize);

      words.forEach(word => {
        line.push(word);
        temp.text(line.join(' '));
        if (temp.node().getComputedTextLength() > maxWidth) {
          line.pop();
          lines.push(line.join(' '));
          line = [word];
        }
      });
      if (line.length) lines.push(line.join(' '));
      temp.remove();

      const startY = -(lines.length - 1) * lineHeight / 2;
      lines.forEach((l, i) => {
        nodeSel
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', startY + i * lineHeight)
          .attr('fill', '#fff')
          .attr('font-size', style.fontSize)
          .attr('font-weight', d.depth === 0 ? 'bold' : '500')
          .style('text-shadow', '0 1px 3px rgba(0,0,0,0.3)')
          .style('pointer-events', 'none')
          .text(l);
      });
    });

    // Auto-fit
    setTimeout(() => {
      const bounds = g.node().getBBox();
      const scale = 0.8 / Math.max(bounds.width / width, bounds.height / height);
      const translate = [
        width / 2 - scale * (bounds.x + bounds.width / 2),
        height / 2 - scale * (bounds.y + bounds.height / 2),
      ];

      svg
        .transition()
        .duration(1000)
        .call(zoomBehavior.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }, 1000);
  }, [mindMapData, filterToImportantNodes]);

  const handleZoomIn = () => {
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 0.7);
  };

  const handleReset = () => {
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    d3.select(svgRef.current)
      .transition()
      .duration(800)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));
    
    // Reset focus
    d3.selectAll('.node rect')
      .transition()
      .duration(300)
      .style('opacity', 1);
  };

  const exportAsImage = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    svgString = svgString.replace(/style="[^"]*"/g, '');
    svgString = svgString.replace('<svg', '<svg style="background:#0f0f23"');
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
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-2xl border border-purple-500/20">
        <div className="text-center p-8">
          <Lightbulb className="mx-auto w-24 h-24 mb-6 text-purple-400 opacity-40 animate-pulse" />
          <p className="text-2xl font-semibold text-gray-200 mb-3">No mind map data available</p>
          <p className="text-sm text-gray-500">Generate content to visualize your learning path</p>
        </div>
      </div>
    );
  }

  const hasPriorityNodes = mindMapData.nodes?.some(n => n.priority === 5);

  return (
    <div className="h-[950px] w-full bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
      {/* 🌌 CSS for pulse glow animation */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 6px #a855f7);
          }
          50% { 
            filter: drop-shadow(0 0 12px #ec4899);
          }
        }
      `}</style>

      <div className="px-6 py-5 bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 backdrop-blur-md border-b border-purple-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 rounded-xl shadow-lg shadow-purple-500/50">
              <Sparkles size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
                {mindMapData.title}
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                  <Filter size={14} />
                  Top 25 by AI
                </span>
                {hasPriorityNodes && (
                  <>
                    <span className="text-purple-400">•</span>
                    <span className="text-yellow-400 flex items-center gap-1 font-medium">
                      ★ Priority nodes
                    </span>
                  </>
                )}
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

      <div ref={containerRef} className="relative" style={{ width: '100%', height: 'calc(100% - 160px)' }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ cursor: 'grab' }}
          onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
          onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
          onMouseLeave={(e) => (e.currentTarget.style.cursor = 'grab')}
        />

        {/* 💡 Tooltip */}
        {tooltip.show && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
            className="bg-gradient-to-br from-gray-900 to-purple-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-purple-500/40 text-sm backdrop-blur-md"
            dangerouslySetInnerHTML={{ __html: tooltip.content }}
          />
        )}

        <div className="absolute bottom-8 right-8 flex flex-col gap-2 bg-gradient-to-br from-black/90 to-purple-900/80 backdrop-blur-xl p-3 rounded-2xl border border-purple-500/40 shadow-2xl">
          <button onClick={handleZoomIn} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all group" title="Zoom In">
            <ZoomIn size={22} className="text-purple-200 group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={handleZoomOut} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all group" title="Zoom Out">
            <ZoomOut size={22} className="text-purple-200 group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={handleReset} className="p-3.5 hover:bg-purple-500/30 rounded-xl transition-all group" title="Reset View">
            <Maximize2 size={22} className="text-purple-200 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="px-6 py-5 bg-gradient-to-r from-black/50 via-purple-900/30 to-black/50 backdrop-blur-md border-t border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            {hasPriorityNodes && (
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 border-2 border-yellow-300 shadow-lg shadow-yellow-500/60" />
                <span className="text-sm text-gray-200 font-semibold">High Priority ★</span>
              </div>
            )}
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
            Powered by Gemini AI • Click nodes to focus
          </div>
        </div>
      </div>
    </div>
  );
}
