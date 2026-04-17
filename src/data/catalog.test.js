import { describe, it, expect } from 'vitest'
import { CATALOG, STEP_DEFAULTS_MAP } from './catalog.js'

describe('CATALOG structure', () => {
  it('exports a non-empty array', () => {
    expect(Array.isArray(CATALOG)).toBe(true)
    expect(CATALOG.length).toBeGreaterThan(0)
  })

  it('every category has a non-empty name and steps array', () => {
    CATALOG.forEach(cat => {
      expect(typeof cat.cat).toBe('string')
      expect(cat.cat.trim().length).toBeGreaterThan(0)
      expect(Array.isArray(cat.steps)).toBe(true)
      expect(cat.steps.length).toBeGreaterThan(0)
    })
  })

  it('every step has required fields', () => {
    CATALOG.forEach(cat => {
      cat.steps.forEach(s => {
        expect(typeof s.type, `${cat.cat} > type`).toBe('string')
        expect(s.type.trim().length, `${cat.cat} > type not empty`).toBeGreaterThan(0)
        expect(typeof s.label, `${cat.cat}/${s.type} > label`).toBe('string')
        expect(typeof s.icon, `${cat.cat}/${s.type} > icon`).toBe('string')
        expect(typeof s.theme, `${cat.cat}/${s.type} > theme`).toBe('string')
        expect(typeof s.tip, `${cat.cat}/${s.type} > tip`).toBe('string')
        expect(typeof s.def, `${cat.cat}/${s.type} > def`).toBe('object')
      })
    })
  })

  it('every step default has a name', () => {
    CATALOG.forEach(cat => {
      cat.steps.forEach(s => {
        expect(typeof s.def.name, `${cat.cat}/${s.type} > def.name`).toBe('string')
        expect(s.def.name.trim().length, `${cat.cat}/${s.type} > def.name not empty`).toBeGreaterThan(0)
      })
    })
  })

  it('every step default has either uses or run (not both)', () => {
    CATALOG.forEach(cat => {
      cat.steps.forEach(s => {
        const hasUses = 'uses' in s.def
        const hasRun = 'run' in s.def
        expect(hasUses || hasRun, `${cat.cat}/${s.type} must have uses or run`).toBe(true)
        expect(hasUses && hasRun, `${cat.cat}/${s.type} must not have both uses and run`).toBe(false)
      })
    })
  })

  it('no duplicate step types across the catalog', () => {
    const allTypes = CATALOG.flatMap(cat => cat.steps.map(s => s.type))
    const unique = new Set(allTypes)
    const duplicates = allTypes.filter((t, i) => allTypes.indexOf(t) !== i)
    expect(duplicates, `duplicate types: ${duplicates.join(', ')}`).toHaveLength(0)
  })
})

describe('STEP_DEFAULTS_MAP', () => {
  it('is exported and is an object', () => {
    expect(typeof STEP_DEFAULTS_MAP).toBe('object')
    expect(STEP_DEFAULTS_MAP).not.toBeNull()
  })

  it('contains an entry for every catalog step type', () => {
    CATALOG.forEach(cat => {
      cat.steps.forEach(s => {
        expect(STEP_DEFAULTS_MAP, `missing key: ${s.type}`).toHaveProperty(s.type)
      })
    })
  })

  it('each entry matches the corresponding catalog def', () => {
    CATALOG.forEach(cat => {
      cat.steps.forEach(s => {
        expect(STEP_DEFAULTS_MAP[s.type]).toEqual(s.def)
      })
    })
  })
})
