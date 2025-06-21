// Configuration for the application
export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',
    model: process.env.OLLAMA_MODEL || 'qwen2.5vl',
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Legal Lens',
  },
} as const;
