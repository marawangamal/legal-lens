// Configuration for the application
export const config = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:1234',
    model: 'qwen2.5vl',
  },
};
