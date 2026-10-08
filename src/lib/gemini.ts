// Google Gemini (free tier). Set GEMINI_API_KEY in your environment;
// GEMINI_MODEL is optional.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

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

  const body = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Gemini request failed (${response.status}).`);
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
