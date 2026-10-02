import type { AIProvider, ExtractionResult } from './provider';

const extractionPrompt = `You are Hamiq's structured data extraction engine. Convert the user's message into ONE useful personal-life object. Return ONLY valid JSON with keys type,title,description,deadline,priority,estimatedHours,confidence. type must be TASK,GOAL,HABIT,EVENT,DEADLINE,PROJECT,SCHEDULE,CONSTRAINT,NOTE,UNKNOWN. Never invent dates, times, tasks, or numbers. confidence is 0 to 1.`;

async function callGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status}): ${await response.text()}`);
  const data = await response.json();
  return String(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

export const geminiAI: AIProvider = {
  async extract(input) {
    const parsed = JSON.parse(await callGemini(`${extractionPrompt}\n\nUSER INPUT:\n${input}`)) as ExtractionResult;
    return { ...parsed, confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.5))) };
  },
  async insights(input) {
    return callGemini(`You are Hamiq's AI explanation layer. Explain these deterministic simulation results concisely. Do not invent numbers. Clearly label modeled results, assumptions and trade-offs.\n\n${JSON.stringify(input)}`);
  }
};
