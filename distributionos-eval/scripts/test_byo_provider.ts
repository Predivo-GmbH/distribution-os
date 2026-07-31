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
eq('sk-proj- → null (ambiguous)', detectProvider('sk-proj-abc'), null)
eq('sk- (moonshot/openai) → null', detectProvider('sk-abcdef'), null)

console.log('providerConflict')
falsy('anthropic + sk-ant- ok', providerConflict('anthropic', 'sk-ant-x'))
truthy('anthropic + sk- flagged', providerConflict('anthropic', 'sk-x'))
truthy('openai + sk-ant- flagged', providerConflict('openai', 'sk-ant-x'))
falsy('openai + sk- ok', providerConflict('openai', 'sk-proj-x'))
falsy('kimi + sk- ok', providerConflict('kimi', 'sk-x'))

console.log('OpenAI buildBody (Chat Completions shape)')
const oaBody = SHAPES.openai.buildBody('gpt-4o', req) as Record<string, unknown>
eq('model set', oaBody.model, 'gpt-4o')
eq('uses max_completion_tokens', oaBody.max_completion_tokens, 4096)
eq('no top-level max_tokens', oaBody.max_tokens, undefined)
eq('no top-level system', oaBody.system, undefined)
eq('system folded as first message', oaBody.messages, [
  { role: 'system', content: 'You are helpful.' },
  { role: 'user', content: 'Hello' },
])

console.log('OpenAI parse (Chat Completions response)')
const oaParsed = SHAPES.openai.parse({
  model: 'gpt-4o-2024-11-20',
  choices: [{ message: { role: 'assistant', content: 'Hi there' } }],
  usage: { prompt_tokens: 12, completion_tokens: 8 },
})
eq('text from choices[0].message.content', oaParsed.text, 'Hi there')
eq('model', oaParsed.model, 'gpt-4o-2024-11-20')
eq('prompt_tokens → input', oaParsed.input, 12)
eq('completion_tokens → output', oaParsed.output, 8)

console.log('OpenAI isUsableModel (auto resolution filter)')
truthy('gpt-4o usable', SHAPES.openai.isUsableModel('gpt-4o'))
falsy('text-embedding-3-large not usable', SHAPES.openai.isUsableModel('text-embedding-3-large') || null)
falsy('gpt-4o-transcribe not usable', SHAPES.openai.isUsableModel('gpt-4o-transcribe') || null)
falsy('gpt-3.5-turbo-instruct not usable', SHAPES.openai.isUsableModel('gpt-3.5-turbo-instruct') || null)

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
