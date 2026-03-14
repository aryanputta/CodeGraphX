import cytoscape from 'cytoscape'
import { useEffect, useRef } from 'react'

function riskColor(risk) {
  if (risk >= 0.7) return '#ef4444'
  if (risk >= 0.4) return '#f59e0b'
  if (risk === 0)  return '#4b5563'
  return '#10b981'
}

function riskBorderColor(risk) {
  if (risk >= 0.7) return '#f87171'
  if (risk >= 0.4) return '#fbbf24'
  if (risk === 0)  return '#6b7280'
  return '#34d399'
}

function buildCyStyle() {
  return [
    {
      selector: 'node',
      style: {
        'background-color': 'data(bgColor)',
        'border-color': 'data(borderColor)',
        'border-width': 2,
        'border-opacity': 0.8,
        label: 'data(label)',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 9,
        color: '#94a3b8',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 4,
        width: 'data(size)',
        height: 'data(size)',
        'overlay-opacity': 0,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 3,
        'border-color': '#06b6d4',
        'border-opacity': 1,
        color: '#e2e8f0',
      },
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 3,
        'border-color': '#06b6d4',
        color: '#e2e8f0',
        'background-color': '#164e63',
      },
    },
    {
      selector: 'node.dimmed',
      style: { opacity: 0.2 },
    },
    {
      selector: 'edge',
      style: {
        width: 1.5,
        'line-color': 'data(edgeColor)',
        'target-arrow-color': 'data(edgeColor)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        opacity: 0.5,
        'overlay-opacity': 0,
      },
    },
    {
      selector: 'edge:selected',
      style: { opacity: 1, width: 2 },
    },
    {
      selector: 'edge.dimmed',
      style: { opacity: 0.05 },
    },
  ]
}

function edgeColor(kind) {
  switch (kind) {
    case 'calls':    return '#3b82f6'
    case 'imports':  return '#6b7280'
    case 'inherits': return '#8b5cf6'
    case 'defines':  return '#06b6d4'
    default:         return '#475569'
  }
}

export default function GraphContainer({ nodes, edges, onNodeSelect, riskFilter = 0, highlightedNodes = [] }) {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tooltip = document.createElement('div')
    tooltip.className = 'cy-tooltip'
    tooltip.style.display = 'none'
    document.body.appendChild(tooltip)
    tooltipRef.current = tooltip

    const filteredNodes = nodes.filter((n) => n.risk >= riskFilter || n.kind === 'external')
    const filteredIds = new Set(filteredNodes.map((n) => n.id))
    const filteredEdges = edges.filter((e) => filteredIds.has(e.src) && filteredIds.has(e.dst))

    const cyNodes = filteredNodes.map((n) => ({
      data: {
        id: n.id,
        label: n.label,
        risk: n.risk,
        bgColor: riskColor(n.risk),
        borderColor: riskBorderColor(n.risk),
        size: Math.max(20, Math.min(48, 14 + n.inDegree * 2)),
        ...n,
      },
    }))

    const cyEdges = filteredEdges.map((e) => ({
      data: {
        id: e.id,
        source: e.src,
        target: e.dst,
        kind: e.kind,
        edgeColor: edgeColor(e.kind),
      },
    }))

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...cyNodes, ...cyEdges],
      style: buildCyStyle(),
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 30,
        refresh: 20,
        fit: true,
        padding: 40,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 450000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        animate: true,
        animationDuration: 800,
        animationEasing: 'ease-out',
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    })

    cyRef.current = cy

    // Hover tooltip
    cy.on('mouseover', 'node', (e) => {
      const node = e.target
      const d = node.data()
      const pos = node.renderedPosition()
      const containerRect = containerRef.current.getBoundingClientRect()
      tooltip.style.display = 'block'
      tooltip.style.left = `${containerRect.left + pos.x + 16}px`
      tooltip.style.top  = `${containerRect.top  + pos.y - 10}px`
      tooltip.innerHTML = `
        <div style="color:#06b6d4;font-weight:600;margin-bottom:6px">${d.label}</div>
        <div style="color:#64748b;margin-bottom:2px">kind · <span style="color:#94a3b8">${d.kind}</span></div>
        <div style="color:#64748b;margin-bottom:2px">risk · <span style="color:${riskBorderColor(d.risk)}">${(d.risk * 100).toFixed(0)}%</span></div>
        <div style="color:#64748b;margin-bottom:2px">in  · <span style="color:#94a3b8">${d.inDegree}</span></div>
        <div style="color:#64748b">out · <span style="color:#94a3b8">${d.outDegree}</span></div>
      `
    })
    cy.on('mouseout', 'node', () => { tooltip.style.display = 'none' })

    // Click
    cy.on('tap', 'node', (e) => {
      onNodeSelect?.(e.target.data())
    })
    cy.on('tap', (e) => {
      if (e.target === cy) onNodeSelect?.(null)
    })

    return () => {
      cy.destroy()
      tooltip.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, riskFilter])

  // Highlight effect
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().removeClass('highlighted dimmed')
    if (highlightedNodes.length > 0) {
      const hl = new Set(highlightedNodes)
      cy.nodes().forEach((n) => {
        if (hl.has(n.id())) n.addClass('highlighted')
        else n.addClass('dimmed')
      })
      cy.edges().addClass('dimmed')
    }
  }, [highlightedNodes])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl"
      style={{ background: '#0a0a18', minHeight: 500 }}
    />
  )
}
