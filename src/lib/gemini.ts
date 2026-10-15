// Google Gemini (free tier). Set GEMINI_API_KEY in your environment;
// GEMINI_MODEL is optional.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string; status?: string };
};

// Turns Gemini's error into something a user can act on. The raw error is
// logged so it shows up in Vercel's runtime logs.
function friendlyError(status: number, body: GeminiResponse) {
  console.error("Gemini request failed", status, body.error);

  if (status === 429) {
    return "Lots of people are captioning right now. Please try again in a minute.";
  }
  if (status === 403 || status === 401 || body.error?.status === "PERMISSION_DENIED") {
    return "The caption AI is temporarily unavailable. Please try again later.";
  }
  if (status === 400) {
    return "The AI couldn't read that photo. Try a different one.";
  }
  return "The caption AI is having trouble right now. Please try again.";
}

export async function generateCaptions({
  prompt,
  image,
  mimeType,
}: {
  prompt: string;
  image: ArrayBuffer;
  mimeType: string;
}): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: Buffer.from(image).toString("base64") } },
            ],
          },
        ],
        generationConfig: {
          temperature: 1,
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
    },
  );

  const body = (await response.json().catch(() => ({}))) as GeminiResponse;
  if (!response.ok) {
    throw new Error(friendlyError(response.status, body));
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const parsed: unknown = JSON.parse(text);
  const captions = Array.isArray(parsed)
    ? parsed.filter((c): c is string => typeof c === "string" && c.trim() !== "")
    : [];

  if (captions.length === 0) {
    throw new Error("The AI didn't return any captions. Try another photo.");
  }
  return captions.slice(0, 3).map((c) => c.trim());
}
