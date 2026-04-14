import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function DropZone({ jobId }) {
  const { addStepFromDrag, dragSrcRef, dispatch } = useApp()
  const [over, setOver] = useState(false)
  const isMobile = useIsMobile()

  const handleClick = () => {
    if (isMobile) dispatch({ type: 'OPEN_MOBILE_STEP_PICKER', payload: jobId })
  }

  const handleDragOver = (e) => {
    if (!dragSrcRef.current) return
    e.preventDefault(); e.stopPropagation(); setOver(true)
  }
  const handleDragLeave = () => setOver(false)
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setOver(false)
    addStepFromDrag(jobId)
  }

  return (
    <div
      className={'drop-zone' + (over ? ' over' : '')}
      data-dzjob={jobId}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={isMobile ? { cursor: 'pointer' } : undefined}
    >
      {isMobile ? '＋ Tap to add a step' : 'Drop steps here'}
    </div>
  )
}
