import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { validate } from '../utils/validation.js'

export default function ValidationOverlay() {
  const { state, dispatch } = useApp()
  const { validationOpen } = state

  if (!validationOpen) return null

  const { errors, warnings } = validate(state.workflowName, state.triggers, state.jobs)
  const allGood = !errors.length && !warnings.length

  const close = () => dispatch({ type: 'CLOSE_VALIDATION' })

  return (
    <div className={'vpanel' + (validationOpen ? ' open' : '')} onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="vpanel-inner">
        <div className="vpanel-head">
          <b>Workflow validation</b>
          <button className="vpanel-x" onClick={close}>×</button>
        </div>
        <div className="vpanel-body">
          {allGood ? (
            <div style={{ padding: '10px 12px', background: '#eaf3de', borderRadius: 7, color: '#173404', fontSize: 13, fontWeight: 500 }}>
              Workflow looks valid — no issues found.
            </div>
          ) : (
            <>
              <div style={{
                padding: '9px 12px', background: errors.length ? '#fcebeb' : '#faeeda',
                borderRadius: 7, color: errors.length ? '#791f1f' : '#633806',
                fontSize: 13, fontWeight: 500, marginBottom: 10
              }}>
                {errors.length ? '✕ ' : '! '}
                {[errors.length && errors.length + ' error' + (errors.length > 1 ? 's' : ''),
                  warnings.length && warnings.length + ' warning' + (warnings.length > 1 ? 's' : '')]
                  .filter(Boolean).join(', ')}
              </div>
              {[...errors.map(m => ({ t: 'error', m })), ...warnings.map(m => ({ t: 'warn', m }))].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '7px 10px',
                  background: item.t === 'error' ? '#fcebeb' : '#faeeda',
                  borderRadius: 6, color: item.t === 'error' ? '#791f1f' : '#633806',
                  fontSize: 12, marginBottom: 4, lineHeight: 1.4
                }}>
                  <span style={{ fontWeight: 700, flexShrink: 0 }}>{item.t === 'error' ? '✕' : '!'}</span>
                  <span>{item.m}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
