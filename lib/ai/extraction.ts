import { demoAI } from './demo';
import { groqAI } from './groq';
import { geminiAI } from './gemini';
import type { AIProvider } from './provider';

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) return geminiAI;
  if (provider === 'groq' && process.env.GROQ_API_KEY) return groqAI;
  return demoAI;
}

export function getAIProviderStatus() {
  const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase();
  const configured = provider === 'gemini' ? Boolean(process.env.GEMINI_API_KEY) : Boolean(process.env.GROQ_API_KEY);
  return { provider, configured, fallback: !configured };
}

export async function extractHamixInput(input: string) { return getAIProvider().extract(input); }
export async function generateHamixInsights(input: unknown) { return getAIProvider().insights(input); }
