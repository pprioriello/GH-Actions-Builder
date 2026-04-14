import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const TABS = [
  {
    id: 'canvas',
    label: 'Canvas',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    id: 'yaml',
    label: 'YAML',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
]

export default function MobileNav() {
  const { state, dispatch } = useApp()
  const { mobileTab } = state

  return (
    <div className="mobile-nav">
      <div className="mobile-nav-btns">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={'mob-nav-btn' + (mobileTab === tab.id ? ' active' : '')}
            onClick={() => dispatch({ type: 'SET_MOBILE_TAB', payload: tab.id })}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
