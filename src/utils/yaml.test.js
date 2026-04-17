import { describe, it, expect } from 'vitest'
import { generateYaml } from './yaml.js'

const job = (overrides = {}) => ({
  id: 'j1',
  name: 'build',
  os: 'ubuntu-latest',
  needs: [],
  steps: [],
  ...overrides,
})

const step = (overrides = {}) => ({
  id: 's1',
  name: 'My step',
  ...overrides,
})

describe('generateYaml – header', () => {
  it('emits workflow name', () => {
    const y = generateYaml('My CI', ['push'], [job()])
    expect(y).toMatch(/^name: My CI\n/)
  })

  it('falls back to "My Workflow" when name is empty', () => {
    const y = generateYaml('', ['push'], [job()])
    expect(y).toMatch(/^name: My Workflow\n/)
  })

  it('falls back to push trigger when triggers array is empty', () => {
    const y = generateYaml('CI', [], [job()])
    expect(y).toContain('  push:\n')
  })
})

describe('generateYaml – triggers', () => {
  it('emits push trigger without branches', () => {
    const y = generateYaml('CI', ['push'], [job()])
    expect(y).toContain('  push:\n')
    expect(y).not.toContain('branches:')
  })

  it('emits push trigger with branches', () => {
    const y = generateYaml('CI', ['push'], [job()], { push: { branches: ['main', 'dev'] } })
    expect(y).toContain('  push:\n    branches:\n      - main\n      - dev\n')
  })

  it('emits pull_request trigger', () => {
    const y = generateYaml('CI', ['pull_request'], [job()])
    expect(y).toContain('  pull_request:\n')
  })

  it('emits schedule with provided cron', () => {
    const y = generateYaml('CI', ['schedule'], [job()], { schedule: { crons: ['0 9 * * 1'] } })
    expect(y).toContain("  schedule:\n    - cron: '0 9 * * 1'\n")
  })

  it('uses default cron when schedule crons list is empty', () => {
    const y = generateYaml('CI', ['schedule'], [job()], { schedule: { crons: [] } })
    expect(y).toContain("    - cron: '0 0 * * *'\n")
  })

  it('emits workflow_dispatch without inputs', () => {
    const y = generateYaml('CI', ['workflow_dispatch'], [job()])
    expect(y).toContain('  workflow_dispatch:\n')
    expect(y).not.toContain('inputs:')
  })

  it('emits workflow_dispatch with inputs', () => {
    const inputs = [{ name: 'env', description: 'Target env', type: 'string', required: true, default: 'prod' }]
    const y = generateYaml('CI', ['workflow_dispatch'], [job()], { workflow_dispatch: { inputs } })
    expect(y).toContain('  workflow_dispatch:\n    inputs:\n')
    expect(y).toContain("      env:\n        description: 'Target env'\n        type: string\n        required: true\n        default: 'prod'\n")
  })

  it('emits workflow_dispatch input with required: false', () => {
    const inputs = [{ name: 'tag', type: 'string', required: false }]
    const y = generateYaml('CI', ['workflow_dispatch'], [job()], { workflow_dispatch: { inputs } })
    expect(y).toContain('        required: false\n')
  })

  it('emits release trigger without types', () => {
    const y = generateYaml('CI', ['release'], [job()])
    expect(y).toContain('  release:\n')
    expect(y).not.toContain('types:')
  })

  it('emits release trigger with types', () => {
    const y = generateYaml('CI', ['release'], [job()], { release: { types: ['published'] } })
    expect(y).toContain('  release:\n    types:\n      - published\n')
  })

  it('emits multiple triggers', () => {
    const y = generateYaml('CI', ['push', 'workflow_dispatch'], [job()])
    expect(y).toContain('  push:\n')
    expect(y).toContain('  workflow_dispatch:\n')
  })
})

describe('generateYaml – permissions', () => {
  it('omits permissions block when empty', () => {
    const y = generateYaml('CI', ['push'], [job()], {}, {})
    expect(y).not.toContain('permissions:')
  })

  it('omits permissions block when all values are falsy', () => {
    const y = generateYaml('CI', ['push'], [job()], {}, { contents: '' })
    expect(y).not.toContain('permissions:')
  })

  it('emits permissions block', () => {
    const y = generateYaml('CI', ['push'], [job()], {}, { contents: 'read', pages: 'write' })
    expect(y).toContain('\npermissions:\n  contents: read\n  pages: write\n')
  })
})

describe('generateYaml – jobs', () => {
  it('emits jobs block', () => {
    const y = generateYaml('CI', ['push'], [job()])
    expect(y).toContain('\njobs:\n  build:\n')
  })

  it('emits runs-on', () => {
    const y = generateYaml('CI', ['push'], [job({ os: 'windows-latest' })])
    expect(y).toContain('    runs-on: windows-latest\n')
  })

  it('emits single needs', () => {
    const jobs = [job({ id: 'j1', name: 'build' }), job({ id: 'j2', name: 'deploy', needs: ['j1'] })]
    const y = generateYaml('CI', ['push'], jobs)
    expect(y).toContain('    needs: build\n')
  })

  it('emits multiple needs as array', () => {
    const jobs = [
      job({ id: 'j1', name: 'build' }),
      job({ id: 'j2', name: 'test' }),
      job({ id: 'j3', name: 'deploy', needs: ['j1', 'j2'] }),
    ]
    const y = generateYaml('CI', ['push'], jobs)
    expect(y).toContain('    needs: [build, test]\n')
  })

  it('emits timeout-minutes when set', () => {
    const y = generateYaml('CI', ['push'], [job({ timeoutMinutes: 30 })])
    expect(y).toContain('    timeout-minutes: 30\n')
  })

  it('omits timeout-minutes when not set', () => {
    const y = generateYaml('CI', ['push'], [job()])
    expect(y).not.toContain('timeout-minutes')
  })

  it('emits job-level env', () => {
    const y = generateYaml('CI', ['push'], [job({ env: { NODE_ENV: 'test' } })])
    expect(y).toContain('    env:\n      NODE_ENV: test\n')
  })

  it('emits comment when job has no steps', () => {
    const y = generateYaml('CI', ['push'], [job({ steps: [] })])
    expect(y).toContain('      # No steps added yet\n')
  })
})

describe('generateYaml – steps', () => {
  it('emits step name', () => {
    const y = generateYaml('CI', ['push'], [job({ steps: [step({ name: 'Checkout' })] })])
    expect(y).toContain('      - name: Checkout\n')
  })

  it('emits uses step', () => {
    const s = step({ uses: 'actions/checkout@v4', with: {} })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        uses: actions/checkout@v4\n')
  })

  it('emits with block and converts camelCase keys to kebab-case', () => {
    const s = step({ uses: 'actions/setup-node@v4', with: { nodeVersion: '20', cacheDir: '/tmp' } })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        with:\n          node-version: 20\n          cache-dir: /tmp\n')
  })

  it('omits with block when empty', () => {
    const s = step({ uses: 'actions/checkout@v4', with: {} })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).not.toContain('        with:\n')
  })

  it('emits single-line run step', () => {
    const s = step({ run: 'npm ci' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        run: npm ci\n')
  })

  it('emits multi-line run with block scalar', () => {
    const s = step({ run: 'echo hello\necho world' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        run: |\n          echo hello\n          echo world\n')
  })

  it('emits step id', () => {
    const s = step({ stepId: 'my-step', run: 'echo hi' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        id: my-step\n')
  })

  it('emits if condition', () => {
    const s = step({ condition: "github.ref == 'refs/heads/main'", run: 'echo hi' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain("        if: github.ref == 'refs/heads/main'\n")
  })

  it('emits continue-on-error', () => {
    const s = step({ continueOnError: true, run: 'npm test' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        continue-on-error: true\n')
  })

  it('omits continue-on-error when false', () => {
    const s = step({ continueOnError: false, run: 'npm test' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).not.toContain('continue-on-error')
  })

  it('emits working-directory', () => {
    const s = step({ run: 'npm ci', workingDirectory: './frontend' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        working-directory: ./frontend\n')
  })

  it('emits shell', () => {
    const s = step({ run: 'echo hi', shell: 'bash' })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        shell: bash\n')
  })

  it('emits step-level env', () => {
    const s = step({ run: 'npm test', env: { CI: 'true' } })
    const y = generateYaml('CI', ['push'], [job({ steps: [s] })])
    expect(y).toContain('        env:\n          CI: true\n')
  })
})
