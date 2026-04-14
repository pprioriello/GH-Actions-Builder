import React, { useState, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import StepItem from './StepItem.jsx'
import DropZone from './DropZone.jsx'
import { useTouchDrag } from '../hooks/useTouchDrag.js'

const OS_OPTIONS = ['ubuntu-latest', 'windows-latest', 'macos-latest']

export default function JobCard({ job, jobIndex }) {
  const { state, dispatch, dragSrcRef } = useApp()
  const [jobDragOver, setJobDragOver] = useState(false)

  const otherJobs = state.jobs.filter(j => j.id !== job.id)

  // ── Touch drag for job reordering ────────────────────────
  const getDragSrc = useCallback(() => ({ kind: 'job', jobId: job.id }), [job.id])

  const onTouchDrop = useCallback((target) => {
    if (!target) { dragSrcRef.current = null; return }
    const targetCard = target.closest('[data-tjobid]')
    if (!targetCard || targetCard.dataset.tjobid === job.id) {
      dragSrcRef.current = null; return
    }
    const fromIdx = state.jobs.findIndex(j => j.id === job.id)
    const toIdx = state.jobs.findIndex(j => j.id === targetCard.dataset.tjobid)
    if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
      dispatch({ type: 'REORDER_JOBS', payload: { fromIdx, toIdx } })
    }
    dragSrcRef.current = null
  }, [job.id, state.jobs, dispatch, dragSrcRef])

  const { handleRef: jobHandleRef, handleTouchStart: jobTouchStart, handleTouchEnd: jobTouchEnd } = useTouchDrag({
    getDragSrc,
    onDrop: onTouchDrop,
    dropTargetSelector: '[data-tjobid]',
  })

  // ── Desktop mouse drag ────────────────────────────────────
  const handleJobDragStart = (e) => {
    dragSrcRef.current = { kind: 'job', jobId: job.id }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'job')
    e.stopPropagation()
    setTimeout(() => { e.currentTarget.closest('.job-card').style.opacity = '0.4' }, 0)
  }

  const handleJobDragEnd = (e) => {
    const card = e.currentTarget.closest('.job-card')
    if (card) card.style.opacity = ''
    setJobDragOver(false)
  }

  const handleJobDragOver = (e) => {
    const src = dragSrcRef.current
    if (!src || src.kind !== 'job') return
    e.preventDefault(); e.stopPropagation()
    if (src.jobId !== job.id) setJobDragOver(true)
  }

  const handleJobDragLeave = () => setJobDragOver(false)

  const handleJobDrop = (e) => {
    setJobDragOver(false)
    const src = dragSrcRef.current
    if (!src || src.kind !== 'job') return
    e.preventDefault(); e.stopPropagation()
    const fromIdx = state.jobs.findIndex(j => j.id === src.jobId)
    const toIdx = jobIndex
    if (fromIdx !== toIdx) dispatch({ type: 'REORDER_JOBS', payload: { fromIdx, toIdx } })
    dragSrcRef.current = null
  }

  return (
    <div
      className={'job-card' + (jobDragOver ? ' job-drag-over' : '')}
      data-tjobid={job.id}
      data-draggable="job"
      onDragOver={handleJobDragOver}
      onDragLeave={handleJobDragLeave}
      onDrop={handleJobDrop}
    >
      <div className="job-header">
        <span
          ref={jobHandleRef}
          className="job-drag-handle"
          title="Drag to reorder"
          draggable
          onDragStart={handleJobDragStart}
          onDragEnd={handleJobDragEnd}
          onTouchStart={jobTouchStart}
          onTouchEnd={jobTouchEnd}
        >
          ⠿
        </span>
        <input
          className="job-name-input"
          value={job.name}
          onChange={e => dispatch({ type: 'UPDATE_JOB', payload: { jobId: job.id, field: 'name', value: e.target.value } })}
        />
        <select
          className="job-select"
          value={job.os}
          onChange={e => dispatch({ type: 'UPDATE_JOB', payload: { jobId: job.id, field: 'os', value: e.target.value } })}
        >
          {OS_OPTIONS.map(os => <option key={os}>{os}</option>)}
        </select>
        {otherJobs.length > 0 && (
          <select
            className="job-select"
            multiple
            size={1}
            style={{ minWidth: 90 }}
            value={job.needs || []}
            onChange={e => {
              const needs = Array.from(e.target.selectedOptions).map(o => o.value)
              dispatch({ type: 'UPDATE_JOB', payload: { jobId: job.id, field: 'needs', value: needs } })
            }}
          >
            {otherJobs.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
        )}
        <button
          className="del-btn"
          data-deljob="1"
          onClick={() => dispatch({ type: 'DELETE_JOB', payload: job.id })}
          title="Delete job"
        >
          ×
        </button>
      </div>
      <div className="job-steps">
        {job.steps.map((step, i) => (
          <StepItem key={step.id} step={step} jobId={job.id} stepIndex={i} />
        ))}
        <DropZone jobId={job.id} />
      </div>
    </div>
  )
}
