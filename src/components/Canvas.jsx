import React from 'react'
import { useApp } from '../contexts/AppContext.jsx'
import JobCard from './JobCard.jsx'
import TriggerSection from './TriggerSection.jsx'

export default function Canvas() {
  const { state, dispatch, genJobId } = useApp()
  const { mobileTab } = state
  const mobActive = mobileTab === 'canvas'

  const addJob = () => {
    const id = genJobId()
    dispatch({
      type: 'ADD_JOB',
      payload: { id, name: 'job-' + (state.jobs.length + 1), os: 'ubuntu-latest', needs: [], steps: [] }
    })
  }

  return (
    <div className={'canvas-area' + (mobActive ? ' mob-active' : '')}>
      <TriggerSection />
      {state.jobs.map((job, i) => (
        <JobCard key={job.id} job={job} jobIndex={i} totalJobs={state.jobs.length} />
      ))}
      <button className="add-job-btn" onClick={addJob}>+ Add job</button>
    </div>
  )
}
