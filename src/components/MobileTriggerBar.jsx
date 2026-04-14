import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const TRIGGERS = ['push', 'pull_request', 'workflow_dispatch', 'schedule', 'release']

export default function MobileTriggerBar() {
  const { state, dispatch } = useApp()
  return (
    <div className="mobile-trigger-bar">
      <span className="mobile-trigger-label">Triggers</span>
      <div className="mobile-trigger-tags">
        {TRIGGERS.map(t => (
          <button
            key={t}
            className={'trigger-tag' + (state.triggers.includes(t) ? ' active' : '')}
            onClick={() => dispatch({ type: 'TOGGLE_TRIGGER', payload: t })}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
