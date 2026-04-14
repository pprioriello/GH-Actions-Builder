import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { CATALOG } from '../data/catalog.js'

export default function Sidebar() {
  const { state, dispatch, dragSrcRef } = useApp()
  const { collapsedCats, sidebarFilter } = state

  const filtered = CATALOG.map(cat => ({
    ...cat,
    steps: sidebarFilter
      ? cat.steps.filter(s => s.label.toLowerCase().includes(sidebarFilter.toLowerCase()))
      : cat.steps
  })).filter(cat => cat.steps.length > 0)

  const handleDragStart = (e, type) => {
    dragSrcRef.current = { kind: 'sidebar', type }
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', type)
  }

  const showTooltip = (e, text) => {
    dispatch({ type: 'SHOW_TOOLTIP', payload: { text, x: e.clientX, y: e.clientY } })
  }
  const moveTooltip = (e) => {
    dispatch({ type: 'MOVE_TOOLTIP', payload: { x: e.clientX, y: e.clientY } })
  }
  const hideTooltip = () => {
    dispatch({ type: 'HIDE_TOOLTIP' })
  }

  return (
    <div className="sidebar">
      <div className="sb-search-wrap">
        <input
          className="sb-search"
          placeholder="Search steps..."
          type="search"
          value={sidebarFilter}
          onChange={e => dispatch({ type: 'SET_SIDEBAR_FILTER', payload: e.target.value })}
        />
      </div>
      <div className="sb-scroll">
        {filtered.map(cat => {
          const collapsed = !sidebarFilter && collapsedCats[cat.cat]
          return (
            <div key={cat.cat}>
              <div
                className="sidebar-label"
                onClick={() => dispatch({ type: 'SET_COLLAPSED_CAT', payload: cat.cat })}
              >
                {cat.cat}
                <span className="sidebar-label-arrow">{collapsed ? '▶' : '▼'}</span>
              </div>
              <div className={'sidebar-section-body' + (collapsed ? ' collapsed' : '')}>
                {cat.steps.map(step => (
                  <div
                    key={step.type}
                    className="step-block"
                    draggable
                    onDragStart={e => handleDragStart(e, step.type)}
                  >
                    <div className={'step-icon ic-' + step.theme}>{step.icon}</div>
                    <span className="step-block-label">{step.label}</span>
                    <button
                      className="help-btn"
                      onMouseEnter={e => { e.stopPropagation(); showTooltip(e, step.tip) }}
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                      onDragStart={e => e.stopPropagation()}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                    >
                      ?
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
