import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OPENAI_API_KEY is not set. Falling back to the template letter.');
}

export const openai = apiKey
  ? new OpenAI({
      apiKey
    })
  : null;
