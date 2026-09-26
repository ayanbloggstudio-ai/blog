import { AIStudioFormState, AIGeneratedContentResult } from '../types/aiStudio';

export async function requestAIGeneration(
  formState: AIStudioFormState
): Promise<AIGeneratedContentResult> {
  const response = await fetch('/api/gemini/generate-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formState),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  const data: AIGeneratedContentResult = await response.json();
  return data;
}
