import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { CATALOG, STEP_DEFAULTS_MAP } from '../data/catalog.js'

export default function MobileStepPickerSheet() {
  const { state, dispatch, genId } = useApp()
  const { mobileStepPickerOpen, mobileStepPickerJobId } = state
  const [filter, setFilter] = useState('')
  const [expandedTip, setExpandedTip] = useState(null)

  const close = () => {
    dispatch({ type: 'CLOSE_MOBILE_STEP_PICKER' })
    setFilter('')
    setExpandedTip(null)
  }

  const addStep = (type) => {
    if (!mobileStepPickerJobId) return
    const def = JSON.parse(JSON.stringify(STEP_DEFAULTS_MAP[type] || { name: type, run: '' }))
    const step = { id: genId(), type, ...def }
    dispatch({ type: 'ADD_STEP', payload: { jobId: mobileStepPickerJobId, step } })
    close()
  }

  const toggleTip = (e, type) => {
    e.stopPropagation()
    setExpandedTip(prev => prev === type ? null : type)
  }

  const filtered = CATALOG.map(cat => ({
    ...cat,
    steps: filter.trim()
      ? cat.steps.filter(s => s.label.toLowerCase().includes(filter.toLowerCase()))
      : cat.steps
  })).filter(cat => cat.steps.length > 0)

  return (
    <>
      <div
        className={'sheet-backdrop' + (mobileStepPickerOpen ? ' visible' : '')}
        onClick={close}
      />
      <div className={'mobile-sheet step-picker-sheet' + (mobileStepPickerOpen ? ' open' : '')}>
        <div className="mobile-sheet-drag-indicator" />
        <div className="mobile-sheet-header">
          <span className="mobile-sheet-title">Add a step</span>
          <input
            className="mobile-sheet-search"
            type="search"
            placeholder="Search steps…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <button className="mobile-sheet-close" onClick={close} aria-label="Close">×</button>
        </div>
        <div className="mobile-sheet-body">
          {filtered.map(cat => (
            <div key={cat.cat} className="picker-category">
              <div className="picker-cat-label">{cat.cat}</div>
              <div className="picker-steps-grid">
                {cat.steps.map(step => (
                  <div key={step.type} className="picker-step-row">
                    <button
                      className="picker-step-btn"
                      onClick={() => addStep(step.type)}
                    >
                      <div className={'step-icon ic-' + step.theme + ' picker-icon'}>{step.icon}</div>
                      <span className="picker-step-label">{step.label}</span>
                    </button>
                    <button
                      className={'picker-tip-btn' + (expandedTip === step.type ? ' active' : '')}
                      onClick={e => toggleTip(e, step.type)}
                      aria-label="Show description"
                    >
                      ?
                    </button>
                    {expandedTip === step.type && (
                      <div className="picker-tip-text">{step.tip}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
