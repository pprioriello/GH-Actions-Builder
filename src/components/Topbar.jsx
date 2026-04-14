import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

function CogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.5 1a.5.5 0 0 0-.492.41L5.72 2.8a4.98 4.98 0 0 0-.9.524l-1.35-.45a.5.5 0 0 0-.59.23l-1.5 2.6a.5.5 0 0 0 .11.63l1.08.87a5.1 5.1 0 0 0 0 1.044l-1.08.87a.5.5 0 0 0-.11.63l1.5 2.6a.5.5 0 0 0 .59.23l1.35-.45c.28.2.582.374.9.524l.288 1.39A.5.5 0 0 0 6.5 15h3a.5.5 0 0 0 .492-.41l.288-1.39a4.98 4.98 0 0 0 .9-.524l1.35.45a.5.5 0 0 0 .59-.23l1.5-2.6a.5.5 0 0 0-.11-.63l-1.08-.87a5.1 5.1 0 0 0 0-1.044l1.08-.87a.5.5 0 0 0 .11-.63l-1.5-2.6a.5.5 0 0 0-.59-.23l-1.35.45a4.98 4.98 0 0 0-.9-.524L9.992 1.41A.5.5 0 0 0 9.5 1h-3Zm1.5 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
    </svg>
  )
}

export default function Topbar() {
  const { state, dispatch, dirty } = useApp()

  return (
    <div className="topbar">
      <span className="topbar-title">GitHub Actions Builder</span>
      <div className="sep" />
      <span className="tb-label">Name:</span>
      <input
        id="wf-name"
        value={state.workflowName}
        onChange={e => dispatch({ type: 'SET_WORKFLOW_NAME', payload: e.target.value })}
      />
      {dirty && (
        <span className="tb-dirty" title="Unsaved changes">●</span>
      )}
      <div className="topbar-right">
        <button className="cog-btn" title="Settings" onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}>
          <CogIcon />
        </button>
      </div>
    </div>
  )
}
