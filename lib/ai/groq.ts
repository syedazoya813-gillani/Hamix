import type { AIProvider, ExtractionResult } from './provider';

const extractionSystem = `You are Hamix's structured data extraction engine. Convert the user's message into ONE useful personal-life object. Return ONLY valid JSON with these keys: type,title,description,deadline,priority,estimatedHours,confidence. type must be one of TASK,GOAL,HABIT,EVENT,DEADLINE,PROJECT,SCHEDULE,CONSTRAINT,NOTE,UNKNOWN. priority must be low, medium, or high. deadline must be an ISO 8601 date/time string only when the message gives a clear deadline; otherwise omit it. estimatedHours must be a number only when reasonably supported. confidence must be between 0 and 1. Never invent a date, time, task, or number. If uncertain, use UNKNOWN or omit uncertain fields.`;

async function callGroq(messages: {role:'system'|'user';content:string}[], jsonMode = false) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not configured');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature: 0.1,
      messages,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Groq request failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return String(data.choices?.[0]?.message?.content || '');
}

export const groqAI: AIProvider = {
  async extract(input) {
    const raw = await callGroq([{ role: 'system', content: extractionSystem }, { role: 'user', content: input }], true);
    const parsed = JSON.parse(raw) as ExtractionResult;
    return {
      type: parsed.type || 'UNKNOWN',
      title: parsed.title,
      description: parsed.description,
      deadline: parsed.deadline,
      priority: parsed.priority,
      estimatedHours: typeof parsed.estimatedHours === 'number' ? parsed.estimatedHours : undefined,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.5)))
    };
  },
  async insights(input) {
    return callGroq([
      { role: 'system', content: 'You are Hamix, an AI explanation layer. Explain the supplied deterministic simulation results in concise, practical language. Do not invent numbers. Clearly distinguish modeled results from facts. Mention important assumptions and trade-offs.' },
      { role: 'user', content: JSON.stringify(input) }
    ]);
  }
};
