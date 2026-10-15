import { CLAUDE_MODEL, generateCaptionsWithClaude } from "./claude";
import { GEMINI_MODEL, generateCaptions as generateCaptionsWithGemini } from "./gemini";

// Uses Claude when ANTHROPIC_API_KEY is set, otherwise Gemini.
export async function writeCaptions(input: { prompt: string; image: ArrayBuffer; mimeType: string }) {
  if (process.env.ANTHROPIC_API_KEY) {
    return { captions: await generateCaptionsWithClaude(input), model: CLAUDE_MODEL };
  }
  return { captions: await generateCaptionsWithGemini(input), model: GEMINI_MODEL };
}
