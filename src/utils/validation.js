function has(types, vals) {
  return vals.some(v => types.includes(v))
}

export function validate(workflowName, triggers, jobs) {
  const errors = []
  const warnings = []

  if (!(workflowName || '').trim()) errors.push('Workflow has no name.')
  if (!triggers.length) errors.push('No triggers selected.')

  if (!jobs.length) {
    errors.push('Workflow has no jobs.')
    return { errors, warnings }
  }

  const jnames = jobs.map(j => (j.name || '').trim())
  jnames.forEach((n, i) => {
    if (!n) errors.push('A job has no name.')
    else if (jnames.indexOf(n) !== i) errors.push('Duplicate job name: ' + n)
  })

  jobs.forEach(job => {
    const jl = 'Job "' + (job.name || '?') + '"'

    if (job.needs && job.needs.length) {
      job.needs.forEach(nid => {
        const dep = jobs.find(j => j.id === nid)
        if (!dep) {
          errors.push(jl + ' depends on a missing job.')
        } else if (dep.needs && dep.needs.includes(job.id)) {
          errors.push('Circular dependency: ' + job.name + ' and ' + dep.name)
        }
      })
    }

    if (!job.steps.length) {
      warnings.push(jl + ' has no steps.')
      return
    }

    const types = job.steps.map(s => s.type)

    if (has(types, ['npm-ci','npm-install','npm-build','npm-test','npm-lint']) && !has(types, ['setup-node']))
      warnings.push(jl + ': npm steps without Setup Node.js.')
    if (has(types, ['pytest','pip-install']) && !has(types, ['setup-python']))
      warnings.push(jl + ': Python steps without Setup Python.')
    if (has(types, ['go-build','go-test']) && !has(types, ['setup-go']))
      warnings.push(jl + ': Go steps without Setup Go.')
    if (has(types, ['cargo-build','cargo-test']) && !has(types, ['setup-rust']))
      warnings.push(jl + ': Cargo steps without Setup Rust.')
    if (has(types, ['maven-build','gradle-build']) && !has(types, ['setup-java']))
      warnings.push(jl + ': JVM build without Setup Java.')
    if (has(types, ['dotnet-build','dotnet-test','dotnet-publish']) && !has(types, ['setup-dotnet']))
      warnings.push(jl + ': .NET steps without Setup .NET.')
    if (has(types, ['docker-build']) && !has(types, ['docker-login','ghcr-login']))
      warnings.push(jl + ': Docker build without registry login.')
    if (has(types, ['deploy-s3','ecr-login','sam-deploy']) && !has(types, ['aws-credentials']))
      warnings.push(jl + ': AWS steps without credentials.')
    if (has(types, ['gcp-gke','deploy-cloudrun']) && !has(types, ['gcp-auth']))
      warnings.push(jl + ': GCP steps without auth.')
    if (has(types, ['azure-webapp','azure-aks']) && !has(types, ['azure-login']))
      warnings.push(jl + ': Azure steps without login.')

    const codeSteps = ['npm-ci','npm-install','npm-build','npm-test','npm-lint','pytest','go-build','go-test','cargo-build','dotnet-build','maven-build','gradle-build']
    const hasCode = job.steps.some(s => codeSteps.includes(s.type))
    if (hasCode && job.steps[0].type !== 'checkout')
      warnings.push(jl + ': code steps present but first step is not Checkout.')

    job.steps.forEach(s => {
      if (!(s.name || '').trim()) errors.push(jl + ': a step has no name.')
      if (s.run !== undefined && !(s.run || '').trim())
        errors.push(jl + ': step "' + s.name + '" has empty run command.')
      if (s.uses !== undefined && !(s.uses || '').trim())
        errors.push(jl + ': step "' + s.name + '" has empty uses field.')
    })

    const snames = job.steps.map(s => (s.name || '').trim())
    snames.forEach((n, i) => {
      if (n && snames.indexOf(n) !== i) warnings.push(jl + ': duplicate step name "' + n + '"')
    })
  })

  return { errors, warnings }
}
