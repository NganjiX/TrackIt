import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER ?? 'anthropic',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-20241022',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
}));
