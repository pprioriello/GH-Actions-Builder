import React, { useState, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { CTX_VARS } from '../data/contextVars.js'
import { STEP_THEME_MAP } from '../data/catalog.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

const THEME_COLORS = {
  blue: '#185fa5', green: '#3b6d11', amber: '#c45e28', gray: '#444441',
  purple: '#534ab7', teal: '#0f6e56', coral: '#d85a30', pink: '#d4537e', red: '#e24b4a',
}

const SHELL_OPTIONS = ['', 'bash', 'sh', 'pwsh', 'powershell', 'python', 'cmd']

function StepForm({ step, jobId, stepId, onUpdate, onUpdateWith, onRemoveWith, onAddWith, onUpdateEnv, onRemoveEnv, onAddEnv, lastFocusedRef }) {
  const [ctxOpen, setCtxOpen] = useState(false)
  const [newWithKey, setNewWithKey] = useState('')
  const [newEnvKey, setNewEnvKey] = useState('')

  const trackFocus = (e) => {
    lastFocusedRef.current = {
      el: e.target,
      field: e.target.dataset.field,
      withKey: e.target.dataset.withkey,
      envKey: e.target.dataset.envkey,
    }
  }

  const insertCtxVar = useCallback((chipValue) => {
    const info = lastFocusedRef.current
    if (!info || !info.el) return
    const el = info.el
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const newValue = el.value.slice(0, start) + chipValue + el.value.slice(end)
    const newPos = start + chipValue.length

    if (info.field === 'name') onUpdate({ name: newValue })
    else if (info.field === 'uses') onUpdate({ uses: newValue })
    else if (info.field === 'run') onUpdate({ run: newValue })
    else if (info.field === 'condition') onUpdate({ condition: newValue })
    else if (info.field === 'with' && info.withKey) onUpdateWith(info.withKey, newValue)
    else if (info.field === 'env' && info.envKey) onUpdateEnv(info.envKey, newValue)

    requestAnimationFrame(() => {
      try { el.focus(); el.setSelectionRange(newPos, newPos) } catch (_) {}
    })
  }, [onUpdate, onUpdateWith, onUpdateEnv])

  const handleAddWith = () => {
    const key = newWithKey.trim()
    if (!key) return
    onAddWith(key)
    setNewWithKey('')
  }

  const handleAddEnv = () => {
    const key = newEnvKey.trim()
    if (!key) return
    onAddEnv(key)
    setNewEnvKey('')
  }

  return (
    <div className="cfg-form">
      {/* Step ID */}
      <div className="cfg-field">
        <label className="cfg-label">Step ID <span className="cfg-label-hint">(id:)</span></label>
        <input
          className="cfg-input cfg-mono"
          placeholder="e.g. my-step"
          value={step.stepId || ''}
          onChange={e => onUpdate({ stepId: e.target.value })}
        />
      </div>

      {/* Name */}
      <div className="cfg-field">
        <label className="cfg-label">Name</label>
        <input
          className="cfg-input"
          value={step.name}
          data-field="name"
          onFocus={trackFocus}
          onChange={e => onUpdate({ name: e.target.value })}
        />
      </div>

      {/* continue-on-error */}
      <div className="cfg-field cfg-checkbox-field">
        <label className="cfg-checkbox-label">
          <input
            type="checkbox"
            checked={!!step.continueOnError}
            onChange={e => onUpdate({ continueOnError: e.target.checked })}
          />
          <span>Continue on error</span>
          <span className="cfg-label-hint">(continue-on-error)</span>
        </label>
      </div>

      {/* Uses */}
      {step.uses !== undefined && (
        <div className="cfg-field">
          <label className="cfg-label">Uses</label>
          <input
            className="cfg-input cfg-mono"
            value={step.uses}
            data-field="uses"
            onFocus={trackFocus}
            onChange={e => onUpdate({ uses: e.target.value })}
          />
        </div>
      )}

      {/* Run */}
      {step.run !== undefined && (
        <>
          <div className="cfg-field">
            <label className="cfg-label">Run</label>
            <textarea
              className="cfg-input cfg-textarea cfg-mono"
              value={step.run}
              data-field="run"
              onFocus={trackFocus}
              onChange={e => onUpdate({ run: e.target.value })}
            />
          </div>
          <div className="cfg-field">
            <label className="cfg-label">Working directory <span className="cfg-label-hint">(working-directory:)</span></label>
            <input
              className="cfg-input cfg-mono"
              placeholder="e.g. ./src"
              value={step.workingDirectory || ''}
              onChange={e => onUpdate({ workingDirectory: e.target.value })}
            />
          </div>
          <div className="cfg-field">
            <label className="cfg-label">Shell</label>
            <select
              className="cfg-input"
              value={step.shell || ''}
              onChange={e => onUpdate({ shell: e.target.value })}
            >
              {SHELL_OPTIONS.map(s => (
                <option key={s} value={s}>{s || '(default)'}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* With */}
      {step.uses !== undefined && (
        <div className="cfg-section-card">
          <div className="cfg-section-label">with:</div>
          {Object.entries(step.with || {}).map(([key, val]) => (
            <div key={key} className="cfg-kv-row">
              <label className="cfg-label cfg-label-mono">{key}</label>
              <div className="cfg-kv-input-row">
                <input
                  className="cfg-input"
                  value={String(val)}
                  data-field="with"
                  data-withkey={key}
                  onFocus={trackFocus}
                  onChange={e => onUpdateWith(key, e.target.value)}
                />
                <button className="cfg-kv-rm" onClick={() => onRemoveWith(key)} title="Remove">×</button>
              </div>
            </div>
          ))}
          <div className="cfg-kv-add-row">
            <input
              className="cfg-input cfg-mono"
              placeholder="key name"
              value={newWithKey}
              onChange={e => setNewWithKey(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddWith() } }}
            />
            <button className="cfg-kv-add-btn" onClick={handleAddWith}>+ Add</button>
          </div>
        </div>
      )}

      {/* Env */}
      <div className="cfg-section-card">
        <div className="cfg-section-label">env:</div>
        {Object.entries(step.env || {}).map(([key, val]) => (
          <div key={key} className="cfg-kv-row">
            <label className="cfg-label cfg-label-mono">{key}</label>
            <div className="cfg-kv-input-row">
              <input
                className="cfg-input"
                value={String(val)}
                data-field="env"
                data-envkey={key}
                onFocus={trackFocus}
                onChange={e => onUpdateEnv(key, e.target.value)}
              />
              <button className="cfg-kv-rm" onClick={() => onRemoveEnv(key)} title="Remove">×</button>
            </div>
          </div>
        ))}
        <div className="cfg-kv-add-row">
          <input
            className="cfg-input cfg-mono"
            placeholder="KEY_NAME"
            value={newEnvKey}
            onChange={e => setNewEnvKey(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEnv() } }}
          />
          <button className="cfg-kv-add-btn" onClick={handleAddEnv}>+ Add</button>
        </div>
      </div>

      {/* Condition */}
      <div className="cfg-field">
        <label className="cfg-label">Condition <span className="cfg-label-hint">(if:)</span></label>
        <input
          className="cfg-input cfg-mono"
          placeholder="e.g. success() || always()"
          value={step.condition || ''}
          data-field="condition"
          onFocus={trackFocus}
          onChange={e => onUpdate({ condition: e.target.value })}
        />
      </div>

      {/* Context vars */}
      <button className={'cfg-ctx-toggle' + (ctxOpen ? ' open' : '')} onClick={() => setCtxOpen(o => !o)}>
        <span>Context variables</span>
        <span className="cfg-ctx-arrow">{ctxOpen ? '▼' : '▶'}</span>
      </button>

      {ctxOpen && (
        <div className="cfg-ctx-body">
          <p className="cfg-ctx-hint">Tap a variable to insert at cursor</p>
          {CTX_VARS.map(group => (
            <div key={group.g} className="cfg-ctx-group">
              <div className="cfg-ctx-group-label">{group.g}</div>
              <div className="cfg-ctx-chips">
                {group.v.map(v => {
                  const chip = '$' + '{{ ' + v + ' }}'
                  return (
                    <button key={v} className="ctx-chip" onClick={() => insertCtxVar(chip)}>
                      {chip}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ConfigPanel() {
  const { state, dispatch, getStep, lastFocusedRef } = useApp()
  const { selectedStep, mobileConfigOpen } = state
  const isMobile = useIsMobile()

  const step = selectedStep ? getStep(selectedStep.jobId, selectedStep.stepId) : null
  const theme = step ? (STEP_THEME_MAP[step.type] || 'gray') : 'gray'
  const themeColor = THEME_COLORS[theme] || '#666'

  const onUpdate = useCallback((updates) => {
    if (!selectedStep) return
    dispatch({ type: 'UPDATE_STEP', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, updates } })
  }, [selectedStep, dispatch])

  const onUpdateWith = useCallback((key, value) => {
    if (!selectedStep) return
    dispatch({ type: 'UPDATE_STEP_WITH', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key, value } })
  }, [selectedStep, dispatch])

  const onRemoveWith = useCallback((key) => {
    if (!selectedStep) return
    dispatch({ type: 'REMOVE_STEP_WITH', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key } })
  }, [selectedStep, dispatch])

  const onAddWith = useCallback((key) => {
    if (!selectedStep) return
    dispatch({ type: 'ADD_STEP_WITH', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key } })
  }, [selectedStep, dispatch])

  const onUpdateEnv = useCallback((key, value) => {
    if (!selectedStep) return
    dispatch({ type: 'UPDATE_STEP_ENV', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key, value } })
  }, [selectedStep, dispatch])

  const onRemoveEnv = useCallback((key) => {
    if (!selectedStep) return
    dispatch({ type: 'REMOVE_STEP_ENV', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key } })
  }, [selectedStep, dispatch])

  const onAddEnv = useCallback((key) => {
    if (!selectedStep) return
    dispatch({ type: 'ADD_STEP_ENV', payload: { jobId: selectedStep.jobId, stepId: selectedStep.stepId, key } })
  }, [selectedStep, dispatch])

  const closeConfig = () => dispatch({ type: 'CLOSE_MOBILE_CONFIG' })

  const sharedProps = {
    step,
    jobId: selectedStep?.jobId,
    stepId: selectedStep?.stepId,
    onUpdate,
    onUpdateWith,
    onRemoveWith,
    onAddWith,
    onUpdateEnv,
    onRemoveEnv,
    onAddEnv,
    lastFocusedRef,
  }

  // ── Mobile: render as bottom sheet ──────────────────────────
  if (isMobile) {
    return (
      <>
        <div
          className={'sheet-backdrop' + (mobileConfigOpen ? ' visible' : '')}
          onClick={closeConfig}
        />
        <div className={'mobile-sheet config-sheet' + (mobileConfigOpen ? ' open' : '')}>
          <div className="mobile-sheet-drag-indicator" />
          <div className="config-sheet-header">
            {step && (
              <span
                className="config-sheet-dot"
                style={{ background: themeColor }}
              />
            )}
            <span className="config-sheet-title">
              {step ? step.name : 'Step config'}
            </span>
            <button className="mobile-sheet-close" onClick={closeConfig} aria-label="Close">×</button>
          </div>

          <div className="mobile-sheet-body">
            {!step ? (
              <div className="no-step">Select a step in the canvas to configure it</div>
            ) : (
              <StepForm {...sharedProps} />
            )}
          </div>
        </div>
      </>
    )
  }

  // ── Desktop: render as sidebar panel ────────────────────────
  return (
    <div className="config-panel">
      <div className="cfg-title">
        {step && <span className="cfg-title-dot" style={{ background: themeColor }} />}
        Step settings
      </div>
      {!step ? (
        <div className="no-step">Select a step to configure it</div>
      ) : (
        <StepForm {...sharedProps} />
      )}
    </div>
  )
}
