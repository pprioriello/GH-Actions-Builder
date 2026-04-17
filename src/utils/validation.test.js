import { describe, it, expect } from 'vitest'
import { validate } from './validation.js'

const job = (overrides = {}) => ({
  id: 'j1',
  name: 'build',
  os: 'ubuntu-latest',
  needs: [],
  steps: [{ id: 's1', name: 'Checkout', type: 'checkout', uses: 'actions/checkout@v4' }],
  ...overrides,
})

const step = (overrides = {}) => ({
  id: 's1',
  name: 'My step',
  type: 'run',
  run: 'echo hi',
  ...overrides,
})

describe('validate – workflow name', () => {
  it('errors on empty name', () => {
    const { errors } = validate('', ['push'], [job()])
    expect(errors).toContain('Workflow has no name.')
  })

  it('errors on whitespace-only name', () => {
    const { errors } = validate('   ', ['push'], [job()])
    expect(errors).toContain('Workflow has no name.')
  })

  it('passes with a valid name', () => {
    const { errors } = validate('My CI', ['push'], [job()])
    expect(errors).not.toContain('Workflow has no name.')
  })
})

describe('validate – triggers', () => {
  it('errors when no triggers', () => {
    const { errors } = validate('CI', [], [job()])
    expect(errors).toContain('No triggers selected.')
  })

  it('passes with at least one trigger', () => {
    const { errors } = validate('CI', ['push'], [job()])
    expect(errors).not.toContain('No triggers selected.')
  })
})

describe('validate – schedule trigger', () => {
  it('warns when schedule has no crons', () => {
    const { warnings } = validate('CI', ['schedule'], [job()], { schedule: { crons: [] } })
    expect(warnings).toContain('Schedule trigger has no cron expressions.')
  })

  it('errors on invalid cron expression (too few parts)', () => {
    const { errors } = validate('CI', ['schedule'], [job()], { schedule: { crons: ['0 9 * *'] } })
    expect(errors[0]).toMatch(/Invalid cron expression #1/)
  })

  it('errors on invalid cron expression (too many parts)', () => {
    const { errors } = validate('CI', ['schedule'], [job()], { schedule: { crons: ['0 9 * * 1 2'] } })
    expect(errors[0]).toMatch(/Invalid cron expression #1/)
  })

  it('passes with valid 5-part cron', () => {
    const { errors } = validate('CI', ['schedule'], [job()], { schedule: { crons: ['0 9 * * 1'] } })
    expect(errors.filter(e => e.includes('cron'))).toHaveLength(0)
  })

  it('reports multiple invalid crons with correct indices', () => {
    const { errors } = validate('CI', ['schedule'], [job()], { schedule: { crons: ['bad', 'also bad'] } })
    expect(errors.some(e => e.includes('#1'))).toBe(true)
    expect(errors.some(e => e.includes('#2'))).toBe(true)
  })
})

describe('validate – jobs', () => {
  it('errors when no jobs', () => {
    const { errors } = validate('CI', ['push'], [])
    expect(errors).toContain('Workflow has no jobs.')
  })

  it('errors on job with no name', () => {
    const { errors } = validate('CI', ['push'], [job({ name: '' })])
    expect(errors).toContain('A job has no name.')
  })

  it('errors on duplicate job names', () => {
    const { errors } = validate('CI', ['push'], [job({ id: 'j1', name: 'build' }), job({ id: 'j2', name: 'build' })])
    expect(errors).toContain('Duplicate job name: build')
  })

  it('errors when job depends on missing job', () => {
    const { errors } = validate('CI', ['push'], [job({ needs: ['missing-id'] })])
    expect(errors.some(e => e.includes('depends on a missing job'))).toBe(true)
  })

  it('errors on circular dependency', () => {
    const jobs = [
      { id: 'j1', name: 'build', needs: ['j2'], steps: [step()] },
      { id: 'j2', name: 'test', needs: ['j1'], steps: [step()] },
    ]
    const { errors } = validate('CI', ['push'], jobs)
    expect(errors.some(e => e.includes('Circular dependency'))).toBe(true)
  })

  it('warns when job has no steps', () => {
    const { warnings } = validate('CI', ['push'], [job({ steps: [] })])
    expect(warnings.some(w => w.includes('has no steps'))).toBe(true)
  })
})

describe('validate – step errors', () => {
  it('errors on step with no name', () => {
    const { errors } = validate('CI', ['push'], [job({ steps: [step({ name: '' })] })])
    expect(errors.some(e => e.includes('a step has no name'))).toBe(true)
  })

  it('errors on step with empty run command', () => {
    const { errors } = validate('CI', ['push'], [job({ steps: [step({ run: '   ' })] })])
    expect(errors.some(e => e.includes('empty run command'))).toBe(true)
  })

  it('errors on step with empty uses field', () => {
    const s = { id: 's1', name: 'Checkout', type: 'checkout', uses: '' }
    const { errors } = validate('CI', ['push'], [job({ steps: [s] })])
    expect(errors.some(e => e.includes('empty uses field'))).toBe(true)
  })

  it('warns on step using action without version pin', () => {
    const s = { id: 's1', name: 'Checkout', type: 'checkout', uses: 'actions/checkout' }
    const { warnings } = validate('CI', ['push'], [job({ steps: [s] })])
    expect(warnings.some(w => w.includes('without version pin'))).toBe(true)
  })

  it('warns on duplicate step names', () => {
    const steps = [step({ id: 's1', name: 'Run' }), step({ id: 's2', name: 'Run' })]
    const { warnings } = validate('CI', ['push'], [job({ steps })])
    expect(warnings.some(w => w.includes('duplicate step name'))).toBe(true)
  })
})

describe('validate – missing setup warnings', () => {
  const makeJob = (types) => job({
    steps: types.map((t, i) => step({ id: `s${i}`, type: t, name: t })),
  })

  it('warns on npm steps without setup-node', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['npm-ci', 'npm-test'])])
    expect(warnings.some(w => w.includes('npm steps without Setup Node.js'))).toBe(true)
  })

  it('no warning when npm steps have setup-node', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['setup-node', 'npm-ci'])])
    expect(warnings.some(w => w.includes('npm steps without Setup Node.js'))).toBe(false)
  })

  it('warns on python steps without setup-python', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['pytest'])])
    expect(warnings.some(w => w.includes('Python steps without Setup Python'))).toBe(true)
  })

  it('warns on go steps without setup-go', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['go-test'])])
    expect(warnings.some(w => w.includes('Go steps without Setup Go'))).toBe(true)
  })

  it('warns on cargo steps without setup-rust', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['cargo-test'])])
    expect(warnings.some(w => w.includes('Cargo steps without Setup Rust'))).toBe(true)
  })

  it('warns on JVM steps without setup-java', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['maven-build'])])
    expect(warnings.some(w => w.includes('JVM build without Setup Java'))).toBe(true)
  })

  it('warns on .NET steps without setup-dotnet', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['dotnet-build'])])
    expect(warnings.some(w => w.includes('.NET steps without Setup .NET'))).toBe(true)
  })

  it('warns on docker build without registry login', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['docker-build'])])
    expect(warnings.some(w => w.includes('Docker build without registry login'))).toBe(true)
  })

  it('warns on AWS steps without credentials', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['deploy-s3'])])
    expect(warnings.some(w => w.includes('AWS steps without credentials'))).toBe(true)
  })

  it('warns on GCP steps without auth', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['gcp-gke'])])
    expect(warnings.some(w => w.includes('GCP steps without auth'))).toBe(true)
  })

  it('warns on Azure steps without login', () => {
    const { warnings } = validate('CI', ['push'], [makeJob(['azure-webapp'])])
    expect(warnings.some(w => w.includes('Azure steps without login'))).toBe(true)
  })
})

describe('validate – checkout order warning', () => {
  it('warns when code step is present but checkout is not first', () => {
    const steps = [
      step({ id: 's1', type: 'npm-ci', name: 'Install', run: 'npm ci' }),
      step({ id: 's2', type: 'checkout', name: 'Checkout', uses: 'actions/checkout@v4' }),
    ]
    const { warnings } = validate('CI', ['push'], [job({ steps })])
    expect(warnings.some(w => w.includes('first step is not Checkout'))).toBe(true)
  })

  it('no warning when checkout is first', () => {
    const steps = [
      step({ id: 's1', type: 'checkout', name: 'Checkout', uses: 'actions/checkout@v4' }),
      step({ id: 's2', type: 'npm-ci', name: 'Install', run: 'npm ci' }),
    ]
    const { warnings } = validate('CI', ['push'], [job({ steps })])
    expect(warnings.some(w => w.includes('first step is not Checkout'))).toBe(false)
  })
})
