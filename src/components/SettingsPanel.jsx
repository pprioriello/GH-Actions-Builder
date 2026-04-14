import React, { useRef } from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const THEMES = [
  { id: 'theme-default', color: '#185fa5', label: 'Default' },
  { id: 'theme-default-dark', color: '#185fa5', label: 'Default dark', dark: true },
  { id: 'theme-warm', color: '#e8824a', label: 'Warm' },
  { id: 'theme-warm-dark', color: '#c45e28', label: 'Warm dark', dark: true },
  { id: 'theme-purple', color: '#3c3489', label: 'Purple' },
  { id: 'theme-purple-dark', color: '#26215c', label: 'Purple dark', dark: true },
  { id: 'theme-teal', color: '#0f6e56', label: 'Teal' },
  { id: 'theme-teal-dark', color: '#085041', label: 'Teal dark', dark: true },
  { id: 'theme-rose', color: '#993556', label: 'Rose' },
  { id: 'theme-rose-dark', color: '#72243e', label: 'Rose dark', dark: true },
]

function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else { fallbackCopy(text) }
  } catch (_) { fallbackCopy(text) }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea')
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta); ta.focus(); ta.select()
  try { document.execCommand('copy') } catch (_) {}
  document.body.removeChild(ta)
}

export default function SettingsPanel() {
  const { state, dispatch, yaml, genJobId } = useApp()
  const { settingsPanelOpen, theme, savedWorkflows } = state
  const fileInputRef = useRef(null)
  const [copyLabel, setCopyLabel] = React.useState('Copy YAML to clipboard')

  const handleTheme = (id) => {
    dispatch({ type: 'SET_THEME', payload: id })
  }

  const handleValidate = () => {
    dispatch({ type: 'SET_VALIDATION', payload: {} })
    dispatch({ type: 'CLOSE_SETTINGS' })
  }

  const handleCopyYaml = () => {
    copyText(yaml)
    setCopyLabel('Copied!')
    setTimeout(() => setCopyLabel('Copy YAML to clipboard'), 1400)
  }

  const handleDownload = () => {
    const name = (state.workflowName || 'workflow').toLowerCase().replace(/\s+/g, '-')
    const a = document.createElement('a')
    a.href = 'data:text/yaml;charset=utf-8,' + encodeURIComponent(yaml)
    a.download = name + '.yml'
    a.click()
  }

  const handleSave = () => {
    dispatch({
      type: 'SAVE_WORKFLOW',
      payload: { name: state.workflowName, jobs: state.jobs, triggers: state.triggers }
    })
  }

  const handleNew = () => {
    dispatch({ type: 'NEW_WORKFLOW', payload: genJobId() })
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target.result
      const m = text.match(/^name:\s*(.+)/m)
      if (m) dispatch({ type: 'SET_WORKFLOW_NAME', payload: m[1].trim() })
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  const handleLoad = (i) => {
    dispatch({ type: 'LOAD_SAVED_WORKFLOW', payload: savedWorkflows[i] })
    dispatch({ type: 'CLOSE_SETTINGS' })
  }

  const handleDeleteSaved = (i) => {
    dispatch({ type: 'DELETE_SAVED_WORKFLOW', payload: i })
  }

  return (
    <div className={'settings-panel' + (settingsPanelOpen ? ' open' : '')}>
      <div className="sp-header">
        <span>Settings</span>
        <button className="sp-close" onClick={() => dispatch({ type: 'CLOSE_SETTINGS' })}>×</button>
      </div>
      <div className="sp-body">
        <div className="sp-section">
          <div className="sp-section-title">Color theme</div>
          <div className="theme-grid">
            {THEMES.map(t => (
              <div
                key={t.id}
                className={'theme-option' + (theme === t.id ? ' active' : '')}
                onClick={() => handleTheme(t.id)}
              >
                <div
                  className="theme-swatch"
                  style={{ background: t.color, borderColor: t.dark ? '#555' : undefined }}
                />
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="sp-section">
          <div className="sp-section-title">Validate</div>
          <button className="sp-btn" onClick={handleValidate}>Validate workflow</button>
        </div>

        <div className="sp-section">
          <div className="sp-section-title">Export</div>
          <button className="sp-btn" onClick={handleCopyYaml}>{copyLabel}</button>
          <button className="sp-btn" onClick={handleDownload}>Download .yml file</button>
        </div>

        <div className="sp-section">
          <div className="sp-section-title">Current workflow</div>
          <button className="sp-btn" onClick={handleSave}>Save workflow locally</button>
          <button className="sp-btn" onClick={handleNew}>New workflow</button>
          <button className="sp-btn" onClick={() => fileInputRef.current?.click()}>Import YAML file</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".yml,.yaml"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>

        <div className="sp-section">
          <div className="sp-section-title">Saved workflows</div>
          {savedWorkflows.length === 0 ? (
            <div className="sp-empty">No saved workflows yet</div>
          ) : (
            <div className="saved-list">
              {savedWorkflows.map((w, i) => (
                <div key={i} className="saved-item">
                  <span>{w.name}</span>
                  <button className="load-btn" onClick={() => handleLoad(i)}>Load</button>
                  <button className="del-saved" onClick={() => handleDeleteSaved(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
