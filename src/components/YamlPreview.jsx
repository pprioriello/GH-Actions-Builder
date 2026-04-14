import React, { useState, useRef, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta); ta.focus(); ta.select()
  try { document.execCommand('copy') } catch (_) {}
  document.body.removeChild(ta)
}

function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else { fallbackCopy(text) }
  } catch (_) { fallbackCopy(text) }
}

export default function YamlPreview() {
  const { state, dispatch, yaml } = useApp()
  const { yamlExpanded, yamlHeight, mobileTab } = state
  const [copyLabel, setCopyLabel] = useState('Copy YAML')
  const resizeRef = useRef({ dragging: false, startY: 0, startH: 0 })
  const isMobile = useIsMobile()
  const mobActive = mobileTab === 'yaml'

  const handleCopy = () => {
    copyText(yaml)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy YAML'), 1400)
  }

  const handleDownload = () => {
    const name = (state.workflowName || 'workflow').toLowerCase().replace(/\s+/g, '-')
    const a = document.createElement('a')
    a.href = 'data:text/yaml;charset=utf-8,' + encodeURIComponent(yaml)
    a.download = name + '.yml'
    a.click()
  }

  const handleToggleCollapse = () => {
    dispatch({ type: 'SET_YAML_EXPANDED', payload: !yamlExpanded })
  }

  const handleResizeMouseDown = useCallback((e) => {
    if (!yamlExpanded) return
    resizeRef.current = { dragging: true, startY: e.clientY, startH: yamlHeight }
    document.body.style.cursor = 'ns-resize'
    document.body.style.userSelect = 'none'

    const onMove = (ev) => {
      if (!resizeRef.current.dragging) return
      const delta = resizeRef.current.startY - ev.clientY
      const nh = Math.max(80, Math.min(window.innerHeight * 0.7, resizeRef.current.startH + delta))
      dispatch({ type: 'SET_YAML_HEIGHT', payload: nh })
    }
    const onUp = () => {
      resizeRef.current.dragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [yamlExpanded, yamlHeight, dispatch])

  // ── Mobile: full-page YAML tab ────────────────────────────
  if (isMobile) {
    return (
      <div className={'yaml-preview yaml-mobile' + (mobActive ? ' mob-active' : '')}>
        <div className="yaml-mobile-topbar">
          <span className="yaml-mobile-title">YAML preview</span>
          <button className="btn primary yaml-mobile-btn" onClick={handleCopy}>{copyLabel}</button>
          <button className="btn yaml-mobile-btn" onClick={handleDownload}>Download</button>
        </div>
        <pre className="yaml-code yaml-mobile-code">{yaml}</pre>
      </div>
    )
  }

  // ── Desktop ───────────────────────────────────────────────
  return (
    <div
      className="yaml-preview"
      style={yamlExpanded ? { height: yamlHeight + 'px' } : { height: 'auto' }}
    >
      <div className="yaml-resize-handle" onMouseDown={handleResizeMouseDown}>
        <div className="yaml-resize-dots" />
      </div>
      <div className="yaml-header">
        <span className="yaml-header-title">YAML preview</span>
        <button className="yaml-collapse-lnk" onClick={handleToggleCollapse}>
          {yamlExpanded ? 'collapse' : 'expand'}
        </button>
      </div>
      {yamlExpanded && (
        <div className="yaml-body">
          <pre className="yaml-code">{yaml}</pre>
          <div className="yaml-actions">
            <button className="btn primary" onClick={handleCopy}>{copyLabel}</button>
            <button className="btn" onClick={handleDownload}>Download .yml</button>
          </div>
        </div>
      )}
    </div>
  )
}
