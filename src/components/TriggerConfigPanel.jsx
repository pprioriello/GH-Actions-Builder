import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'

const PERMISSION_KEYS = [
  'contents', 'pull-requests', 'issues', 'packages',
  'actions', 'id-token', 'checks', 'deployments', 'statuses', 'security-events',
]
const PERM_VALUES = ['read', 'write', 'none']

export default function TriggerConfigPanel() {
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
    const prev = triggerConfig.schedule?.crons || []
    updateConfig('schedule', { crons: [...prev, val] })
    setCronDraft('')
  }
  const removeCron = (i) =>
    updateConfig('schedule', { crons: (triggerConfig.schedule?.crons || []).filter((_, idx) => idx !== i) })
  const updateCron = (i, val) => {
    const crons = [...(triggerConfig.schedule?.crons || [])]
    crons[i] = val
    updateConfig('schedule', { crons })
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
  const permKeys = Object.keys(permissions)
  const availPerms = PERMISSION_KEYS.filter(k => !(k in permissions))

  return (
    <div className="trigger-config-panel">
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

      {hasSchedule && (
        <div className="tcp-section">
          <div className="tcp-label">schedule crons</div>
          <div className="tcp-crons">
            {(triggerConfig.schedule?.crons || []).map((c, i) => (
              <div key={i} className="tcp-cron-row">
                <input
                  className="tcp-input tcp-mono"
                  value={c}
                  onChange={e => updateCron(i, e.target.value)}
                  placeholder="0 0 * * *"
                />
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
  )
}
