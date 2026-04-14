import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const TRIGGERS = ['push', 'pull_request', 'workflow_dispatch', 'schedule', 'release']
const PERMISSION_KEYS = [
  'contents', 'pull-requests', 'issues', 'packages',
  'actions', 'id-token', 'checks', 'deployments', 'statuses', 'security-events',
]
const PERM_VALUES = ['read', 'write', 'none']
const RELEASE_TYPES = ['published', 'created', 'edited', 'deleted', 'prereleased', 'released']
const DISPATCH_INPUT_TYPES = ['string', 'boolean', 'choice', 'environment', 'number']

function isValidCron(expr) {
  if (!expr || !expr.trim()) return false
  return expr.trim().split(/\s+/).length === 5
}

export default function TriggerSection() {
  const { state, dispatch } = useApp()
  const { triggers, triggerConfig = {}, permissions = {} } = state

  const [branchDraft, setBranchDraft] = useState({})
  const [cronDraft, setCronDraft] = useState('')
  const [newPermKey, setNewPermKey] = useState('')

  const updateConfig = (trigger, config) =>
    dispatch({ type: 'UPDATE_TRIGGER_CONFIG', payload: { trigger, config } })

  // Branches
  const addBranch = (trigger) => {
    const val = (branchDraft[trigger] || '').trim()
    if (!val) return
    const prev = triggerConfig[trigger]?.branches || []
    if (!prev.includes(val)) updateConfig(trigger, { branches: [...prev, val] })
    setBranchDraft(d => ({ ...d, [trigger]: '' }))
  }
  const removeBranch = (trigger, b) =>
    updateConfig(trigger, { branches: (triggerConfig[trigger]?.branches || []).filter(x => x !== b) })

  // Crons
  const addCron = () => {
    const val = cronDraft.trim()
    if (!val) return
    updateConfig('schedule', { crons: [...(triggerConfig.schedule?.crons || []), val] })
    setCronDraft('')
  }
  const removeCron = (i) =>
    updateConfig('schedule', { crons: (triggerConfig.schedule?.crons || []).filter((_, idx) => idx !== i) })
  const updateCron = (i, val) => {
    const crons = [...(triggerConfig.schedule?.crons || [])]
    crons[i] = val
    updateConfig('schedule', { crons })
  }

  // Release types
  const toggleReleaseType = (type) => {
    const prev = triggerConfig.release?.types || []
    const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    updateConfig('release', { types: next })
  }

  // workflow_dispatch inputs
  const dispatchInputs = triggerConfig.workflow_dispatch?.inputs || []

  const addDispatchInput = () => {
    const newInput = { name: '', description: '', type: 'string', required: false, default: '' }
    updateConfig('workflow_dispatch', { inputs: [...dispatchInputs, newInput] })
  }

  const updateDispatchInput = (i, field, value) => {
    const inputs = dispatchInputs.map((inp, idx) => idx === i ? { ...inp, [field]: value } : inp)
    updateConfig('workflow_dispatch', { inputs })
  }

  const removeDispatchInput = (i) => {
    updateConfig('workflow_dispatch', { inputs: dispatchInputs.filter((_, idx) => idx !== i) })
  }

  // Permissions
  const setPerms = (p) => dispatch({ type: 'SET_PERMISSIONS', payload: p })
  const addPerm = () => {
    if (!newPermKey) return
    setPerms({ ...permissions, [newPermKey]: 'read' })
    setNewPermKey('')
  }
  const updatePerm = (key, val) => setPerms({ ...permissions, [key]: val })
  const removePerm = (key) => { const p = { ...permissions }; delete p[key]; setPerms(p) }

  const branchTriggers = triggers.filter(t => t === 'push' || t === 'pull_request')
  const hasSchedule = triggers.includes('schedule')
  const hasRelease = triggers.includes('release')
  const hasDispatch = triggers.includes('workflow_dispatch')
  const permKeys = Object.keys(permissions)
  const availPerms = PERMISSION_KEYS.filter(k => !(k in permissions))

  return (
    <div className="trigger-card">
      <div className="trigger-card-row">
        <span className="trigger-card-label">Triggers</span>
        <div className="trigger-tag-list">
          {TRIGGERS.map(t => (
            <button
              key={t}
              className={'trigger-tag' + (triggers.includes(t) ? ' active' : '')}
              onClick={() => dispatch({ type: 'TOGGLE_TRIGGER', payload: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="trigger-card-config">
        {branchTriggers.map(t => (
          <div key={t} className="tcp-section">
            <div className="tcp-label">{t === 'pull_request' ? 'PR' : 'push'} branches</div>
            <div className="tcp-row">
              {(triggerConfig[t]?.branches || []).map(b => (
                <span key={b} className="tcp-tag">
                  {b}
                  <button className="tcp-rm" onClick={() => removeBranch(t, b)}>×</button>
                </span>
              ))}
              <input
                className="tcp-input"
                value={branchDraft[t] || ''}
                placeholder="branch…"
                onChange={e => setBranchDraft(d => ({ ...d, [t]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBranch(t) } }}
              />
              <button className="tcp-add" onClick={() => addBranch(t)}>+</button>
            </div>
          </div>
        ))}

        {hasRelease && (
          <div className="tcp-section">
            <div className="tcp-label">release types</div>
            <div className="tcp-release-types">
              {RELEASE_TYPES.map(type => (
                <label key={type} className="tcp-checkbox-label">
                  <input
                    type="checkbox"
                    checked={(triggerConfig.release?.types || []).includes(type)}
                    onChange={() => toggleReleaseType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasSchedule && (
          <div className="tcp-section">
            <div className="tcp-label">schedule crons</div>
            <div className="tcp-crons">
              {(triggerConfig.schedule?.crons || []).map((c, i) => (
                <div key={i} className="tcp-cron-row">
                  <input
                    className={'tcp-input tcp-mono' + (!isValidCron(c) && c.trim() ? ' tcp-input-warn' : '')}
                    value={c}
                    onChange={e => updateCron(i, e.target.value)}
                    placeholder="0 0 * * *"
                  />
                  {!isValidCron(c) && c.trim() && (
                    <span className="tcp-cron-warn" title="Invalid cron: must have 5 space-separated parts">⚠</span>
                  )}
                  <button className="tcp-rm" onClick={() => removeCron(i)}>×</button>
                </div>
              ))}
              <div className="tcp-cron-row">
                <input
                  className="tcp-input tcp-mono"
                  value={cronDraft}
                  placeholder="add cron…"
                  onChange={e => setCronDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCron() } }}
                />
                <button className="tcp-add" onClick={addCron}>+</button>
              </div>
            </div>
          </div>
        )}

        {hasDispatch && (
          <div className="tcp-section tcp-section-wide">
            <div className="tcp-label">workflow_dispatch inputs</div>
            <div className="tcp-dispatch-inputs">
              {dispatchInputs.map((inp, i) => (
                <div key={i} className="tcp-dispatch-row">
                  <input
                    className="tcp-input tcp-mono"
                    placeholder="input name"
                    value={inp.name}
                    onChange={e => updateDispatchInput(i, 'name', e.target.value)}
                  />
                  <input
                    className="tcp-input"
                    placeholder="description"
                    value={inp.description}
                    onChange={e => updateDispatchInput(i, 'description', e.target.value)}
                  />
                  <select
                    className="tcp-select"
                    value={inp.type}
                    onChange={e => updateDispatchInput(i, 'type', e.target.value)}
                  >
                    {DISPATCH_INPUT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <label className="tcp-checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!inp.required}
                      onChange={e => updateDispatchInput(i, 'required', e.target.checked)}
                    />
                    <span>required</span>
                  </label>
                  <input
                    className="tcp-input"
                    placeholder="default"
                    value={inp.default}
                    onChange={e => updateDispatchInput(i, 'default', e.target.value)}
                  />
                  <button className="tcp-rm" onClick={() => removeDispatchInput(i)}>×</button>
                </div>
              ))}
              <button className="tcp-add" onClick={addDispatchInput}>+ Add input</button>
            </div>
          </div>
        )}

        <div className="tcp-section">
          <div className="tcp-label">permissions</div>
          <div className="tcp-crons">
            {permKeys.map(key => (
              <div key={key} className="tcp-cron-row">
                <span className="tcp-perm-key">{key}</span>
                <select className="tcp-select" value={permissions[key]} onChange={e => updatePerm(key, e.target.value)}>
                  {PERM_VALUES.map(v => <option key={v}>{v}</option>)}
                </select>
                <button className="tcp-rm" onClick={() => removePerm(key)}>×</button>
              </div>
            ))}
            <div className="tcp-cron-row">
              <select className="tcp-select" value={newPermKey} onChange={e => setNewPermKey(e.target.value)}>
                <option value="">add permission…</option>
                {availPerms.map(k => <option key={k}>{k}</option>)}
              </select>
              {newPermKey && <button className="tcp-add" onClick={addPerm}>+</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
