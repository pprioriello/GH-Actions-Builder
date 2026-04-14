import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'

export default function Tooltip() {
  const { state } = useApp()
  const { tooltip } = state

  if (!tooltip.visible) return null

  return (
    <div
      className="tooltip"
      style={{
        left: Math.min(tooltip.x + 12, window.innerWidth - 220) + 'px',
        top: Math.min(tooltip.y + 12, window.innerHeight - 100) + 'px',
      }}
    >
      {tooltip.text}
    </div>
  )
}
