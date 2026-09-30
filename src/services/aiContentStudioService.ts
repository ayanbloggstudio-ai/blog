import {
  AIStudioFormState,
  AIGeneratedContentResult,
  AIRefineAction,
  NovelAIPayload,
  NovelAIResult,
  GeminiStatusInfo
} from '../types/aiStudio';
import { getAuthToken } from './apiClient';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function checkGeminiStatus(): Promise<GeminiStatusInfo> {
  const response = await fetch('/api/gemini/status', {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return {
      isConfigured: false,
      model: 'gemini-3.8-flash',
      error: err.error || `Server responded with ${response.status}`
    };
  }

  return response.json();
}

export async function requestAIGeneration(
  formState: AIStudioFormState
): Promise<AIGeneratedContentResult> {
  const response = await fetch('/api/gemini/generate-content', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(formState),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Generation failed (HTTP ${response.status})`);
  }

  const data: AIGeneratedContentResult = await response.json();
  return data;
}

export async function requestTextRefinement(params: {
  action: AIRefineAction;
  text: string;
  context?: string;
  topic?: string;
  instructions?: string;
}): Promise<{ resultText: string; action: AIRefineAction }> {
  const response = await fetch('/api/gemini/refine-text', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Refinement failed (HTTP ${response.status})`);
  }

  return response.json();
}

export async function requestNovelGeneration(
  payload: NovelAIPayload
): Promise<NovelAIResult> {
  const response = await fetch('/api/gemini/generate-novel', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Novel generation failed (HTTP ${response.status})`);
  }

  return response.json();
}
