import { getAIProvider } from './extraction';
export async function generateInsights(result:unknown){ return getAIProvider().insights(result); }
