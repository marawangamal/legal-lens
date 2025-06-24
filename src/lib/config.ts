// Configuration for the application
export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:1234',
    visionModel: 'qwen2.5vl',
    reasoningModel: 'deepseek-r1:8b',
  },
};
