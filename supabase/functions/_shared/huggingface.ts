export const HF_HEADERS = (apiKey: string) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
});

export const HF_SUMMARIZATION_MODEL = "facebook/bart-large-cnn";
export const HF_SUMMARIZATION_URL = `https://api-inference.huggingface.co/models/${HF_SUMMARIZATION_MODEL}`;