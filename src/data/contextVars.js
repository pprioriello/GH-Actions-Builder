export const CTX_VARS = [
  { g: 'GitHub', v: ['github.sha', 'github.ref', 'github.ref_name', 'github.event_name', 'github.actor', 'github.repository', 'github.run_id', 'github.run_number', 'github.workspace'] },
  { g: 'Runner', v: ['runner.os', 'runner.arch', 'runner.temp'] },
  { g: 'Secrets', v: ['secrets.GITHUB_TOKEN', 'secrets.MY_SECRET'] },
  { g: 'Env', v: ['env.MY_VAR'] },
  { g: 'Steps', v: ['steps.STEP_ID.outputs.result', 'steps.STEP_ID.conclusion'] },
  { g: 'Job', v: ['job.status'] },
  { g: 'Matrix', v: ['matrix.os', 'matrix.node-version'] },
]
