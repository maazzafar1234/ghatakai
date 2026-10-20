import { useState } from 'react';
import {
  CloudSTTConfig,
  CloudLLMConfig,
  AIIntegrationStatus,
} from '@/lib/types';

export interface UseCloudAIOptions {
  onSTTResult?: (text: string) => void;
  onLLMResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useCloudAI(options: UseCloudAIOptions = {}) {
  const [status, setStatus] = useState<AIIntegrationStatus>({
    stt: 'disabled',
    llm: 'disabled',
    lastError: null,
  });
  const [sttConfig, setSttConfig] = useState<CloudSTTConfig>({
    provider: 'none',
    enabled: false,
  });
  const [llmConfig, setLlmConfig] = useState<CloudLLMConfig>({
    provider: 'none',
    enabled: false,
  });

  const startSTT = async (): Promise<void> => {
    if (!sttConfig.enabled || !sttConfig.apiKey) {
      setStatus((prev) => ({ ...prev, stt: 'disabled', lastError: 'STT not configured' }));
      return;
    }
    setStatus((prev) => ({ ...prev, stt: 'listening', lastError: null }));
    // Placeholder: actual STT integration requires backend implementation
    options.onSTTResult?.('STT integration pending backend implementation.');
    setStatus((prev) => ({ ...prev, stt: 'idle' }));
  };

  const stopSTT = async (): Promise<void> => {
    setStatus((prev) => ({ ...prev, stt: 'idle' }));
  };

  const generateLLMResponse = async (prompt: string): Promise<string> => {
    if (!llmConfig.enabled || !llmConfig.apiKey) {
      const err = 'LLM not configured';
      setStatus((prev) => ({ ...prev, llm: 'error', lastError: err }));
      options.onError?.(err);
      return '';
    }
    setStatus((prev) => ({ ...prev, llm: 'generating', lastError: null }));
    // Placeholder: actual LLM integration requires backend implementation
    setStatus((prev) => ({ ...prev, llm: 'idle' }));
    const response = `Placeholder LLM response for: "${prompt}". Cloud LLM integration pending backend implementation.`;
    options.onLLMResult?.(response);
    return response;
  };

  const configureSTT = (config: Partial<CloudSTTConfig>): void => {
    setSttConfig((prev) => ({ ...prev, ...config }));
  };

  const configureLLM = (config: Partial<CloudLLMConfig>): void => {
    setLlmConfig((prev) => ({ ...prev, ...config }));
  };

  return {
    status,
    sttConfig,
    llmConfig,
    startSTT,
    stopSTT,
    generateLLMResponse,
    configureSTT,
    configureLLM,
  };
}
