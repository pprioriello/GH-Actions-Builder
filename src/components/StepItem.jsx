import React, { useState, useCallback } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { STEP_THEME_MAP } from '../data/catalog.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { useTouchDrag } from '../hooks/useTouchDrag.js'

export default function StepItem({ step, jobId, stepIndex }) {
  const { state, dispatch, dragSrcRef, addStepFromDrag } = useApp()
  const [dragOver, setDragOver] = useState(false)
  const isMobile = useIsMobile()
  const theme = STEP_THEME_MAP[step.type] || 'gray'
  const isSelected = state.selectedStep?.jobId === jobId && state.selectedStep?.stepId === step.id

  // ── Touch drag (handle → reorder/move) ───────────────────
  const getDragSrc = useCallback(() => ({
    kind: 'step', stepId: step.id, fromJobId: jobId, fromIdx: stepIndex,
  }), [step.id, jobId, stepIndex])

  const onTouchDrop = useCallback((target) => {
    if (!target) { dragSrcRef.current = null; return }
    dragSrcRef.current = { kind: 'step', stepId: step.id, fromJobId: jobId, fromIdx: stepIndex }
    const targetStep = target.closest('[data-sid]')
    const targetDZ = target.closest('[data-dzjob]')
    if (targetStep) {
      const toJobId = targetStep.dataset.jid
      const toIdx = parseInt(targetStep.dataset.si)
      if (toJobId && !isNaN(toIdx)) addStepFromDrag(toJobId, toIdx)
      else dragSrcRef.current = null
    } else if (targetDZ) {
      addStepFromDrag(targetDZ.dataset.dzjob)
    } else {
      dragSrcRef.current = null
    }
  }, [step.id, jobId, stepIndex, dragSrcRef, addStepFromDrag])

  const { handleRef: touchHandleRef, handleTouchStart, handleTouchEnd } = useTouchDrag({
    getDragSrc,
    onDrop: onTouchDrop,
    dropTargetSelector: '[data-sid],[data-dzjob]',
  })

  // ── Desktop mouse drag ────────────────────────────────────
  const handleClick = (e) => {
    if (e.target.closest('[data-delstep]')) return
    dispatch({ type: 'SELECT_STEP', payload: { jobId, stepId: step.id } })
    if (isMobile) dispatch({ type: 'OPEN_MOBILE_CONFIG' })
  }

  const handleDragStart = (e) => {
    dragSrcRef.current = { kind: 'step', stepId: step.id, fromJobId: jobId, fromIdx: stepIndex }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', 'step')
    e.stopPropagation()
    setTimeout(() => { if (e.target) e.target.style.opacity = '0.4' }, 0)
  }

  const handleDragEnd = (e) => { e.target.style.opacity = ''; setDragOver(false) }
  const handleDragOver = (e) => {
    if (!dragSrcRef.current) return
    e.preventDefault(); e.stopPropagation(); setDragOver(true)
  }
  const handleDragLeave = () => setDragOver(false)
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false)
    addStepFromDrag(jobId, stepIndex)
  }
  const handleDelete = (e) => {
    e.stopPropagation()
    dispatch({ type: 'DELETE_STEP', payload: { jobId, stepId: step.id } })
  }

  return (
    <div
      className={'step-item t-' + theme + (isSelected ? ' selected' : '') + (dragOver ? ' drag-over' : '')}
      data-draggable="step"
      data-sid={step.id}
      data-jid={jobId}
      data-si={stepIndex}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag handle — touch drag starts here on mobile */}
      <span
        ref={touchHandleRef}
        className="handle"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        ⠿
      </span>
      <span className="step-label">{step.name}</span>
      <button
        className="del-btn"
        data-delstep="1"
        onClick={handleDelete}
        title="Remove step"
      >
        ×
      </button>
    </div>
  )
}
