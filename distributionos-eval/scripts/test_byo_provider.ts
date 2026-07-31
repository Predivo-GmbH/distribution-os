/**
 * Unit test for the BYO multi-provider adapter (Task C, 2026-07-30).
 * Verifies the pure request/response mapping — the risk area, since Anthropic/Kimi and
 * OpenAI have different shapes. No network. Run:  npx tsx scripts/test_byo_provider.ts
 */
import {
  detectProvider,
  providerConflict,
  SHAPES,
  type ByoRequest,
} from '../../supabase/functions/_shared/byo-provider.ts'

let passed = 0
let failed = 0
function eq(name: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got)
  const w = JSON.stringify(want)
  if (g === w) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name}\n      got:  ${g}\n      want: ${w}`)
  }
}
function truthy(name: string, got: unknown) { eq(name, Boolean(got), true) }
function falsy(name: string, got: unknown) { eq(name, got ?? null, null) }

const req: ByoRequest = {
  tier: 'smart',
  requestedModel: 'auto',
  maxTokens: 4096,
  system: 'You are helpful.',
  messages: [{ role: 'user', content: 'Hello' }],
}

console.log('detectProvider')
eq('sk-ant- → anthropic', detectProvider('sk-ant-abc123'), 'anthropic')
eq('sk- (moonshot) → null (ambiguous)', detectProvider('sk-abcdef'), null)

console.log('providerConflict')
falsy('anthropic + sk-ant- ok', providerConflict('anthropic', 'sk-ant-x'))
truthy('anthropic + sk- flagged', providerConflict('anthropic', 'sk-x'))
truthy('kimi + sk-ant- flagged', providerConflict('kimi', 'sk-ant-x'))
falsy('kimi + sk- ok', providerConflict('kimi', 'sk-x'))

console.log('Anthropic buildBody (Messages shape)')
const anBody = SHAPES.anthropic.buildBody('claude-sonnet-x', req) as Record<string, unknown>
eq('top-level system', anBody.system, 'You are helpful.')
eq('max_tokens (not max_completion_tokens)', anBody.max_tokens, 4096)
eq('no thinking key on anthropic', anBody.thinking, undefined)
eq('messages passthrough', anBody.messages, [{ role: 'user', content: 'Hello' }])

console.log('Kimi buildBody (Messages + thinking disabled)')
const kiBody = SHAPES.kimi.buildBody('kimi-k2.6', req) as Record<string, unknown>
eq('thinking disabled', kiBody.thinking, { type: 'disabled' })
eq('top-level system', kiBody.system, 'You are helpful.')

console.log('Anthropic parse (Messages response)')
const anParsed = SHAPES.anthropic.parse({
  model: 'claude-sonnet-x',
  content: [{ type: 'text', text: 'line1' }, { type: 'text', text: 'line2' }],
  usage: { input_tokens: 20, output_tokens: 5 },
})
eq('joins text blocks', anParsed.text, 'line1\nline2')
eq('input_tokens', anParsed.input, 20)
eq('output_tokens', anParsed.output, 5)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
