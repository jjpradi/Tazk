// Global setup for Vitest — runs before every test file.
// Brings in jest-dom's custom matchers (toBeInTheDocument, toHaveTextContent, etc.)
// and resets any globals between tests.
import * as matchers from '@testing-library/jest-dom/matchers'
import { afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'

// Older @testing-library/jest-dom (v5.x) doesn't ship a /vitest subpath —
// extend vitest's expect with the jest-dom matchers manually.
expect.extend(matchers)

// Unmount everything RTL rendered between tests so state doesn't leak.
afterEach(() => {
    cleanup()
})

// Silence known noisy warnings that don't indicate test failure:
// MUI + emotion in JSDOM/Happy-DOM sometimes warns about act() for async effects,
// and React Router v6 occasionally warns about future flags.
const IGNORED_WARN_PATTERNS = [
    /Warning: `ReactDOMTestUtils\.act`/,
    /An update to .* inside a test was not wrapped in act/,
    /React Router Future Flag Warning/,
    /When testing, code that causes React state updates/,
    /Selector unknown returned the root state when called/,
]
const isIgnored = (args) =>
    typeof args[0] === 'string' && IGNORED_WARN_PATTERNS.some(p => p.test(args[0]))

const origError = console.error
const origWarn = console.warn
console.error = (...args) => { if (!isIgnored(args)) origError.apply(console, args) }
console.warn = (...args) => { if (!isIgnored(args)) origWarn.apply(console, args) }
