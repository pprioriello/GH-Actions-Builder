function toKebab(str) {
  return str.replace(/([A-Z])/g, c => '-' + c.toLowerCase())
}

export function generateYaml(workflowName, triggers, jobs, triggerConfig = {}, permissions = {}) {
  let y = 'name: ' + (workflowName || 'My Workflow') + '\n\non:\n'

  const activeTriggers = triggers.length ? triggers : ['push']
  activeTriggers.forEach(t => {
    const cfg = triggerConfig[t] || {}
    if (t === 'schedule') {
      const crons = cfg.crons?.filter(c => c.trim()).length ? cfg.crons.filter(c => c.trim()) : ['0 0 * * *']
      y += '  schedule:\n'
      crons.forEach(c => { y += "    - cron: '" + c.trim() + "'\n" })
    } else if (t === 'workflow_dispatch') {
      const inputs = (cfg.inputs || []).filter(i => i.name?.trim())
      if (inputs.length) {
        y += '  workflow_dispatch:\n    inputs:\n'
        inputs.forEach(inp => {
          y += '      ' + inp.name.trim() + ':\n'
          if (inp.description) y += '        description: \'' + inp.description + '\'\n'
          y += '        type: ' + (inp.type || 'string') + '\n'
          y += '        required: ' + (inp.required ? 'true' : 'false') + '\n'
          if (inp.default) y += '        default: \'' + inp.default + '\'\n'
        })
      } else {
        y += '  workflow_dispatch:\n'
      }
    } else if (t === 'release') {
      const types = cfg.types || []
      if (types.length) {
        y += '  release:\n    types:\n'
        types.forEach(type => { y += '      - ' + type + '\n' })
      } else {
        y += '  release:\n'
      }
    } else {
      const branches = (cfg.branches || []).filter(b => b.trim())
      if (branches.length) {
        y += '  ' + t + ':\n    branches:\n'
        branches.forEach(b => { y += '      - ' + b + '\n' })
      } else {
        y += '  ' + t + ':\n'
      }
    }
  })

  const permEntries = Object.entries(permissions).filter(([, v]) => v)
  if (permEntries.length) {
    y += '\npermissions:\n'
    permEntries.forEach(([k, v]) => { y += '  ' + k + ': ' + v + '\n' })
  }

  y += '\njobs:\n'

  jobs.forEach(job => {
    const jobName = job.name || 'job'
    y += '  ' + jobName + ':\n'
    y += '    runs-on: ' + job.os + '\n'

    if (job.needs && job.needs.length) {
      const needNames = job.needs.map(nid => {
        const dep = jobs.find(j => j.id === nid)
        return dep ? dep.name : nid
      })
      if (needNames.length === 1) {
        y += '    needs: ' + needNames[0] + '\n'
      } else {
        y += '    needs: [' + needNames.join(', ') + ']\n'
      }
    }

    if (job.timeoutMinutes) {
      y += '    timeout-minutes: ' + job.timeoutMinutes + '\n'
    }

    if (job.env && Object.keys(job.env).length) {
      y += '    env:\n'
      Object.entries(job.env).forEach(([k, v]) => {
        y += '      ' + k + ': ' + v + '\n'
      })
    }

    y += '    steps:\n'

    if (!job.steps.length) {
      y += '      # No steps added yet\n'
      return
    }

    job.steps.forEach(s => {
      y += '      - name: ' + s.name + '\n'
      if (s.stepId) {
        y += '        id: ' + s.stepId + '\n'
      }
      if (s.condition) {
        y += '        if: ' + s.condition + '\n'
      }
      if (s.continueOnError) {
        y += '        continue-on-error: true\n'
      }
      if (s.uses !== undefined) {
        y += '        uses: ' + s.uses + '\n'
        if (s.with && Object.keys(s.with).length) {
          y += '        with:\n'
          Object.entries(s.with).forEach(([k, v]) => {
            y += '          ' + toKebab(k) + ': ' + v + '\n'
          })
        }
      } else if (s.run !== undefined) {
        if (s.workingDirectory) {
          y += '        working-directory: ' + s.workingDirectory + '\n'
        }
        if (s.shell) {
          y += '        shell: ' + s.shell + '\n'
        }
        if (s.run.includes('\n')) {
          y += '        run: |\n'
          s.run.split('\n').forEach(line => {
            y += '          ' + line + '\n'
          })
        } else {
          y += '        run: ' + s.run + '\n'
        }
      }
      if (s.env && Object.keys(s.env).length) {
        y += '        env:\n'
        Object.entries(s.env).forEach(([k, v]) => {
          y += '          ' + k + ': ' + v + '\n'
        })
      }
    })
  })

  return y
}
