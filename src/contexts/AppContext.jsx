import React, { createContext, useContext, useReducer, useRef, useCallback, useMemo, useEffect, useState } from 'react'
import { STEP_DEFAULTS_MAP } from '../data/catalog.js'
import { generateYaml } from '../utils/yaml.js'

const AppContext = createContext(null)

const initialJobs = [{
  id: 'job-1',
  name: 'build',
  os: 'ubuntu-latest',
  needs: [],
  steps: [
    { id: 's1', type: 'checkout', name: 'Checkout code', uses: 'actions/checkout@v4', with: { ref: '', fetchDepth: '1' } },
    { id: 's2', type: 'setup-node', name: 'Setup Node.js', uses: 'actions/setup-node@v4', with: { nodeVersion: '20', cache: 'npm' } },
    { id: 's3', type: 'npm-ci', name: 'Install dependencies', run: 'npm ci' },
    { id: 's4', type: 'npm-test', name: 'Run tests', run: 'npm test' },
  ]
}]

const STORAGE_THEME = 'gha-builder:theme'
const STORAGE_WORKFLOW = 'gha-builder:workflow'
const STORAGE_SAVED = 'gha-builder:savedWorkflows'

const DEFAULT_TRIGGER_CONFIG = {
  push: { branches: [] },
  pull_request: { branches: [] },
  schedule: { crons: [] },
  release: { types: [] },
  workflow_dispatch: { inputs: [] },
}

function getInitialState() {
  const defaults = {
    workflowName: 'CI Pipeline',
    triggers: ['push', 'workflow_dispatch'],
    triggerConfig: DEFAULT_TRIGGER_CONFIG,
    permissions: {},
    jobs: initialJobs,
    selectedStep: null,
    theme: 'theme-default',
    savedWorkflows: [],
    collapsedCats: {},
    sidebarFilter: '',
    settingsPanelOpen: false,
    validationOpen: false,
    validationResults: { errors: [], warnings: [] },
    yamlExpanded: true,
    yamlHeight: 200,
    mobileTab: 'canvas',
    tooltip: { visible: false, text: '', x: 0, y: 0 },
    mobileStepPickerOpen: false,
    mobileStepPickerJobId: null,
    mobileConfigOpen: false,
  }
  try {
    const theme = localStorage.getItem(STORAGE_THEME) || defaults.theme
    const workflowRaw = localStorage.getItem(STORAGE_WORKFLOW)
    const savedRaw = localStorage.getItem(STORAGE_SAVED)
    const workflow = workflowRaw ? JSON.parse(workflowRaw) : {}
    const savedWorkflows = savedRaw ? JSON.parse(savedRaw) : []
    return {
      ...defaults,
      theme,
      savedWorkflows,
      ...workflow,
      triggerConfig: { ...DEFAULT_TRIGGER_CONFIG, ...(workflow.triggerConfig || {}) },
      permissions: workflow.permissions || {},
    }
  } catch {
    return defaults
  }
}

function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WORKFLOW_NAME':
      return { ...state, workflowName: action.payload }

    case 'TOGGLE_TRIGGER': {
      const t = action.payload
      const active = state.triggers.includes(t)
      let next = active ? state.triggers.filter(x => x !== t) : [...state.triggers, t]
      if (next.length === 0) next = ['push']
      // Seed default cron when schedule is first added
      let triggerConfig = state.triggerConfig
      if (!active && t === 'schedule' && !triggerConfig.schedule?.crons?.length) {
        triggerConfig = { ...triggerConfig, schedule: { crons: ['0 0 * * *'] } }
      }
      return { ...state, triggers: next, triggerConfig }
    }

    case 'UPDATE_TRIGGER_CONFIG': {
      const { trigger, config } = action.payload
      return {
        ...state,
        triggerConfig: {
          ...state.triggerConfig,
          [trigger]: { ...state.triggerConfig[trigger], ...config },
        }
      }
    }

    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload }

    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.payload] }

    case 'DELETE_JOB': {
      const id = action.payload
      const jobs = state.jobs
        .filter(j => j.id !== id)
        .map(j => ({ ...j, needs: (j.needs || []).filter(n => n !== id) }))
      const sel = state.selectedStep?.jobId === id ? null : state.selectedStep
      return { ...state, jobs, selectedStep: sel }
    }

    case 'UPDATE_JOB': {
      const { jobId, field, value } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === jobId ? { ...j, [field]: value } : j)
      }
    }

    case 'REORDER_JOBS': {
      const { fromIdx, toIdx } = action.payload
      const jobs = [...state.jobs]
      const [moved] = jobs.splice(fromIdx, 1)
      jobs.splice(toIdx, 0, moved)
      return { ...state, jobs }
    }

    case 'ADD_STEP': {
      const { jobId, step, beforeIdx } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j => {
          if (j.id !== jobId) return j
          const steps = [...j.steps]
          if (beforeIdx !== undefined) steps.splice(beforeIdx, 0, step)
          else steps.push(step)
          return { ...j, steps }
        })
      }
    }

    case 'DELETE_STEP': {
      const { jobId, stepId } = action.payload
      const sel = state.selectedStep?.stepId === stepId ? null : state.selectedStep
      return {
        ...state,
        selectedStep: sel,
        mobileConfigOpen: sel === null ? false : state.mobileConfigOpen,
        jobs: state.jobs.map(j =>
          j.id === jobId ? { ...j, steps: j.steps.filter(s => s.id !== stepId) } : j
        )
      }
    }

    case 'UPDATE_STEP': {
      const { jobId, stepId, updates } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s => s.id !== stepId ? s : { ...s, ...updates })
          }
        )
      }
    }

    case 'UPDATE_STEP_WITH': {
      const { jobId, stepId, key, value } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s =>
              s.id !== stepId ? s : { ...s, with: { ...s.with, [key]: value } }
            )
          }
        )
      }
    }

    case 'UPDATE_STEP_ENV': {
      const { jobId, stepId, key, value } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s =>
              s.id !== stepId ? s : { ...s, env: { ...(s.env || {}), [key]: value } }
            )
          }
        )
      }
    }

    case 'ADD_STEP_WITH': {
      const { jobId, stepId, key } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s =>
              s.id !== stepId ? s : { ...s, with: { ...(s.with || {}), [key]: '' } }
            )
          }
        )
      }
    }

    case 'REMOVE_STEP_WITH': {
      const { jobId, stepId, key } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s => {
              if (s.id !== stepId) return s
              const w = { ...(s.with || {}) }; delete w[key]
              return { ...s, with: w }
            })
          }
        )
      }
    }

    case 'ADD_STEP_ENV': {
      const { jobId, stepId, key } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s =>
              s.id !== stepId ? s : { ...s, env: { ...(s.env || {}), [key]: '' } }
            )
          }
        )
      }
    }

    case 'REMOVE_STEP_ENV': {
      const { jobId, stepId, key } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : {
            ...j,
            steps: j.steps.map(s => {
              if (s.id !== stepId) return s
              const e = { ...(s.env || {}) }; delete e[key]
              return { ...s, env: e }
            })
          }
        )
      }
    }

    case 'UPDATE_JOB_ENV': {
      const { jobId, key, value } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j =>
          j.id !== jobId ? j : { ...j, env: { ...(j.env || {}), [key]: value } }
        )
      }
    }

    case 'REMOVE_JOB_ENV': {
      const { jobId, key } = action.payload
      return {
        ...state,
        jobs: state.jobs.map(j => {
          if (j.id !== jobId) return j
          const e = { ...(j.env || {}) }; delete e[key]
          return { ...j, env: e }
        })
      }
    }

    case 'MOVE_STEP': {
      const { fromJobId, fromIdx, toJobId, toIdx } = action.payload
      const jobs = cloneDeep(state.jobs)
      const fromJob = jobs.find(j => j.id === fromJobId)
      const toJob = jobs.find(j => j.id === toJobId)
      if (!fromJob || !toJob) return state
      const [moved] = fromJob.steps.splice(fromIdx, 1)
      const insertIdx = (toJobId === fromJobId && toIdx > fromIdx) ? toIdx - 1 : toIdx
      toJob.steps.splice(insertIdx, 0, moved)
      return { ...state, jobs }
    }

    case 'APPEND_STEP_FROM_JOB': {
      const { fromJobId, fromIdx, toJobId } = action.payload
      const jobs = cloneDeep(state.jobs)
      const fromJob = jobs.find(j => j.id === fromJobId)
      const toJob = jobs.find(j => j.id === toJobId)
      if (!fromJob || !toJob) return state
      const [moved] = fromJob.steps.splice(fromIdx, 1)
      toJob.steps.push(moved)
      return { ...state, jobs }
    }

    case 'SELECT_STEP':
      return { ...state, selectedStep: action.payload }

    case 'SET_THEME':
      return { ...state, theme: action.payload }

    case 'SAVE_WORKFLOW': {
      const { name, jobs, triggers, triggerConfig, permissions } = action.payload
      const existing = state.savedWorkflows.findIndex(w => w.name === name)
      const entry = {
        name, jobs: cloneDeep(jobs), triggers: [...triggers],
        triggerConfig: cloneDeep(triggerConfig || {}),
        permissions: { ...(permissions || {}) },
        ts: Date.now(),
      }
      const saved = [...state.savedWorkflows]
      if (existing >= 0) saved[existing] = entry
      else saved.push(entry)
      return { ...state, savedWorkflows: saved }
    }

    case 'DELETE_SAVED_WORKFLOW': {
      const saved = [...state.savedWorkflows]
      saved.splice(action.payload, 1)
      return { ...state, savedWorkflows: saved }
    }

    case 'LOAD_SAVED_WORKFLOW': {
      const w = action.payload
      return {
        ...state,
        workflowName: w.name,
        jobs: cloneDeep(w.jobs),
        triggers: [...w.triggers],
        triggerConfig: { ...DEFAULT_TRIGGER_CONFIG, ...(w.triggerConfig || {}) },
        permissions: w.permissions || {},
        selectedStep: null,
      }
    }

    case 'SET_COLLAPSED_CAT':
      return { ...state, collapsedCats: { ...state.collapsedCats, [action.payload]: !state.collapsedCats[action.payload] } }

    case 'SET_SIDEBAR_FILTER':
      return { ...state, sidebarFilter: action.payload }

    case 'TOGGLE_SETTINGS':
      return { ...state, settingsPanelOpen: !state.settingsPanelOpen }

    case 'CLOSE_SETTINGS':
      return { ...state, settingsPanelOpen: false }

    case 'SET_VALIDATION':
      return { ...state, validationResults: action.payload, validationOpen: true }

    case 'CLOSE_VALIDATION':
      return { ...state, validationOpen: false }

    case 'SET_YAML_EXPANDED':
      return { ...state, yamlExpanded: action.payload }

    case 'SET_YAML_HEIGHT':
      return { ...state, yamlHeight: action.payload }

    case 'SET_MOBILE_TAB':
      return { ...state, mobileTab: action.payload }

    case 'SHOW_TOOLTIP':
      return { ...state, tooltip: { visible: true, text: action.payload.text, x: action.payload.x, y: action.payload.y } }

    case 'MOVE_TOOLTIP':
      return { ...state, tooltip: { ...state.tooltip, x: action.payload.x, y: action.payload.y } }

    case 'HIDE_TOOLTIP':
      return { ...state, tooltip: { ...state.tooltip, visible: false } }

    case 'NEW_WORKFLOW':
      return {
        ...state,
        workflowName: 'New Workflow',
        triggers: ['push'],
        triggerConfig: DEFAULT_TRIGGER_CONFIG,
        permissions: {},
        jobs: [{ id: action.payload, name: 'build', os: 'ubuntu-latest', needs: [], steps: [] }],
        selectedStep: null,
      }

    // Mobile sheet actions
    case 'OPEN_MOBILE_STEP_PICKER':
      return { ...state, mobileStepPickerOpen: true, mobileStepPickerJobId: action.payload }

    case 'CLOSE_MOBILE_STEP_PICKER':
      return { ...state, mobileStepPickerOpen: false, mobileStepPickerJobId: null }

    case 'OPEN_MOBILE_CONFIG':
      return { ...state, mobileConfigOpen: true }

    case 'CLOSE_MOBILE_CONFIG':
      return { ...state, mobileConfigOpen: false }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState)

  // Seed the counter above the highest numeric ID already in the loaded state
  // so that new IDs never collide with IDs restored from localStorage.
  const uidRef = useRef(null)
  if (uidRef.current === null) {
    let max = 100
    state.jobs.forEach(job => {
      const jn = parseInt(job.id.replace(/\D+/g, ''), 10)
      if (!isNaN(jn)) max = Math.max(max, jn)
      job.steps.forEach(step => {
        const sn = parseInt(step.id.replace(/\D+/g, ''), 10)
        if (!isNaN(sn)) max = Math.max(max, sn)
      })
    })
    uidRef.current = max
  }

  const dragSrcRef = useRef(null)
  const lastFocusedRef = useRef(null)

  // Dirty tracking — skips first mount, marks dirty on any workflow change
  const [dirty, setDirty] = useState(false)
  const isMountedRef = useRef(false)
  useEffect(() => {
    if (!isMountedRef.current) { isMountedRef.current = true; return }
    setDirty(true)
  }, [state.workflowName, state.triggers, state.triggerConfig, state.permissions, state.jobs])

  useEffect(() => {
    localStorage.setItem(STORAGE_THEME, state.theme)
  }, [state.theme])

  const saveWorkflow = useCallback(() => {
    localStorage.setItem(STORAGE_WORKFLOW, JSON.stringify({
      workflowName: state.workflowName,
      triggers: state.triggers,
      triggerConfig: state.triggerConfig,
      permissions: state.permissions,
      jobs: state.jobs,
    }))
    setDirty(false)
  }, [state.workflowName, state.triggers, state.triggerConfig, state.permissions, state.jobs])

  useEffect(() => {
    localStorage.setItem(STORAGE_SAVED, JSON.stringify(state.savedWorkflows))
  }, [state.savedWorkflows])

  const genId = useCallback(() => 's' + (++uidRef.current), [])
  const genJobId = useCallback(() => 'job-' + (++uidRef.current), [])

  const yaml = useMemo(
    () => generateYaml(state.workflowName, state.triggers, state.jobs, state.triggerConfig, state.permissions),
    [state.workflowName, state.triggers, state.jobs, state.triggerConfig, state.permissions]
  )

  const getStep = useCallback((jobId, stepId) => {
    const job = state.jobs.find(j => j.id === jobId)
    return job?.steps.find(s => s.id === stepId)
  }, [state.jobs])

  const addStepFromDrag = useCallback((toJobId, toIdx) => {
    const src = dragSrcRef.current
    if (!src) return
    if (src.kind === 'sidebar') {
      const def = JSON.parse(JSON.stringify(STEP_DEFAULTS_MAP[src.type] || { name: src.type, run: '' }))
      const step = { id: genId(), type: src.type, ...def }
      if (toIdx !== undefined) {
        dispatch({ type: 'ADD_STEP', payload: { jobId: toJobId, step, beforeIdx: toIdx } })
      } else {
        dispatch({ type: 'ADD_STEP', payload: { jobId: toJobId, step } })
      }
    } else if (src.kind === 'step') {
      if (toIdx !== undefined) {
        dispatch({ type: 'MOVE_STEP', payload: { fromJobId: src.fromJobId, fromIdx: src.fromIdx, toJobId, toIdx } })
      } else {
        dispatch({ type: 'APPEND_STEP_FROM_JOB', payload: { fromJobId: src.fromJobId, fromIdx: src.fromIdx, toJobId } })
      }
    }
    dragSrcRef.current = null
  }, [genId])

  const value = {
    state,
    dispatch,
    dragSrcRef,
    lastFocusedRef,
    genId,
    genJobId,
    yaml,
    getStep,
    addStepFromDrag,
    saveWorkflow,
    dirty,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
