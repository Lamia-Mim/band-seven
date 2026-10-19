// One streaming chat interface over three "brains":
//   local   an open model running in the browser (WebLLM + WebGPU): free, private, no key
//   gemini  Google Gemini with the student's own free API key
//   claude  Claude with the student's own Anthropic API key
//
// streamChat yields text as it arrives. Keys stay in this browser and are sent
// only to the provider's own API.

export class AiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // setup | key | rate | network | gpu | refused | other
  }
}

export const LOCAL_MODELS = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Light', size: '0.9 GB', note: 'Fastest. Short, simple explanations in English.' },
  { id: 'Qwen3-1.7B-q4f16_1-MLC', name: 'Balanced', size: '2 GB', note: 'Better reasoning and some Bangla. Good for most laptops.' },
  { id: 'Qwen3-4B-q4f16_1-MLC', name: 'Best', size: '3.4 GB', note: 'Best answers on this device. Needs a strong laptop.' },
];

export const CLAUDE_MODELS = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5', note: 'Most capable' },
  { id: 'claude-sonnet-5-5', name: 'Claude Sonnet 5.5', note: 'Fast and capable' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5', note: 'Fastest and cheapest' },
];

export const hasWebGPU = () => typeof navigator !== 'undefined' && !!navigator.gpu;

export function aiReady(ai) {
  if (!ai?.provider) return false;
  if (ai.provider === 'gemini') return !!ai.geminiKey;
  if (ai.provider === 'claude') return !!ai.claudeKey;
  return true;
}

export function providerName(ai) {
  if (ai?.provider === 'local') return `On-device · ${LOCAL_MODELS.find((m) => m.id === ai.localModel)?.name ?? 'model'}`;
  if (ai?.provider === 'gemini') return 'Gemini';
  if (ai?.provider === 'claude') return CLAUDE_MODELS.find((m) => m.id === ai.claudeModel)?.name ?? 'Claude';
  return 'Not set up';
}

// ---------- on-device ----------

let engine = null, engineModel = null;

export async function loadLocal(modelId, onProgress) {
  if (!hasWebGPU()) throw new AiError('gpu', 'This browser or device doesn’t support WebGPU, which the on-device AI needs. Try Chrome or Edge on a recent laptop, or use a free Gemini key instead.');
  if (engine && engineModel === modelId) return engine;
  const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
  engineModel = modelId;
  engine = CreateWebWorkerMLCEngine(
    new Worker(new URL('./webllm.worker.js', import.meta.url), { type: 'module' }),
    modelId,
    { initProgressCallback: (p) => onProgress?.(p) },
  );
  engine.catch(() => { engine = null; engineModel = null; });
  return engine;
}

export async function isLocalDownloaded(modelId) {
  try {
    const { hasModelInCache } = await import('@mlc-ai/web-llm');
    return await hasModelInCache(modelId);
  } catch {
    return false;
  }
}

async function* local(ai, { system, messages, signal, onStatus }) {
  const eng = await loadLocal(ai.localModel, onStatus);
  const stream = await eng.chat.completions.create({
    messages: [{ role: 'system', content: system }, ...messages],
    stream: true,
    temperature: 0.6,
    max_tokens: 1200,
    ...(/Qwen3/.test(ai.localModel) ? { extra_body: { enable_thinking: false } } : {}),
  });
  for await (const chunk of stream) {
    if (signal?.aborted) { eng.interruptGenerate(); return; }
    yield chunk.choices[0]?.delta?.content || '';
  }
}

// ---------- Gemini ----------

const GEMINI = 'https://generativelanguage.googleapis.com/v1beta';
let geminiModelCache = null;

// Model names change often, so pick the newest stable Flash model the key can use
export async function geminiModel(key) {
  if (geminiModelCache?.key === key) return geminiModelCache.name;
  const r = await fetch(`${GEMINI}/models?pageSize=200&key=${encodeURIComponent(key)}`);
  if (!r.ok) throw httpError(r.status);
  const { models = [] } = await r.json();
  const version = (n) => parseFloat(n.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] || 0);
  const usable = models
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent') && /gemini-[\d.]+-flash/.test(m.name) && !/(live|tts|image|audio|embedding|preview|exp|native)/.test(m.name))
    .sort((a, b) => version(b.name) - version(a.name) || /lite/.test(a.name) - /lite/.test(b.name));
  if (!usable.length) throw new AiError('other', 'No Gemini Flash model is available for this key.');
  geminiModelCache = { key, name: usable[0].name };
  return usable[0].name;
}

async function* gemini(ai, { system, messages, signal }) {
  const model = await geminiModel(ai.geminiKey);
  const r = await fetch(`${GEMINI}/${model}:streamGenerateContent?alt=sse&key=${encodeURIComponent(ai.geminiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
    }),
  });
  if (!r.ok) throw httpError(r.status);
  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      try {
        const data = JSON.parse(line.slice(5));
        const parts = data.candidates?.[0]?.content?.parts || [];
        yield parts.filter((p) => !p.thought).map((p) => p.text || '').join('');
      } catch { /* partial line */ }
    }
  }
}

// ---------- Claude ----------

async function* claude(ai, { system, messages, signal }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: ai.claudeKey, dangerouslyAllowBrowser: true, maxRetries: 1 });
  const model = ai.claudeModel || 'claude-opus-5-5';
  const params = { model, max_tokens: 4000, system, messages, thinking: { type: 'adaptive' }, output_config: { effort: 'low' } };
  // Server-side refusal fallback where the model supports it
  const stream = model === 'claude-haiku-5-5'
    ? client.messages.stream(params, { signal })
    : client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }, { signal });
  try {
    for await (const ev of stream) {
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') yield ev.delta.text;
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') throw new AiError('refused', 'The AI declined to answer this. Try rephrasing.');
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) throw new AiError('key', 'Your Claude API key was rejected.');
    if (e instanceof Anthropic.RateLimitError) throw new AiError('rate', 'Too many requests for this key. Wait a minute and try again.');
    if (e instanceof Anthropic.APIConnectionError) throw new AiError('network', 'Couldn’t reach the AI. Check your connection.');
    if (e instanceof Anthropic.APIUserAbortError) return;
    throw new AiError('other', e.message || 'The AI returned an error.');
  }
}

// ---------- shared ----------

function httpError(status) {
  if (status === 400 || status === 401 || status === 403) return new AiError('key', 'The API key was rejected. Check it in Settings → AI.');
  if (status === 429) return new AiError('rate', 'The free quota for this key is used up for now. Try again later.');
  return new AiError('other', `The AI service returned an error (${status}).`);
}

// Streams visible text: hides any <think>…</think> reasoning a model might emit
export async function* streamChat(ai, opts) {
  if (typeof window !== 'undefined' && window.__band7FakeAI) { yield* window.__band7FakeAI(opts); return; }
  if (!aiReady(ai)) throw new AiError('setup', 'Set up the AI first.');
  const source = ai.provider === 'local' ? local(ai, opts) : ai.provider === 'gemini' ? gemini(ai, opts) : claude(ai, opts);
  let raw = '', shown = 0;
  try {
    for await (const piece of source) {
      raw += piece;
      const visible = raw.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').replace(/^\s+/, '');
      if (visible.length > shown) { yield visible.slice(shown); shown = visible.length; }
    }
  } catch (e) {
    if (e?.name === 'AbortError') return;
    if (e instanceof AiError) throw e;
    if (e instanceof TypeError) throw new AiError('network', 'Couldn’t reach the AI. Check your connection.');
    throw new AiError('other', e?.message || 'Something went wrong with the AI.');
  }
}

// Collects a whole answer
export async function complete(ai, opts) {
  let out = '';
  for await (const t of streamChat(ai, opts)) out += t;
  return out;
}
