export async function generateWithGemini({ apiKey, model, systemInstruction, prompt }) {
  const usesDeveloperInstruction = !model.toLowerCase().startsWith("gemma-");
  const effectivePrompt = usesDeveloperInstruction
    ? prompt
    : `${systemInstruction.trim()}\n\n${prompt.trim()}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(
        usesDeveloperInstruction
          ? {
              system_instruction: {
                parts: [{ text: systemInstruction }],
              },
              contents: [
                {
                  role: "user",
                  parts: [{ text: effectivePrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.9,
                responseMimeType: "application/json",
              },
            }
          : {
              contents: [
                {
                  role: "user",
                  parts: [{ text: effectivePrompt }],
                },
              ],
              generationConfig: {
                temperature: 0.9,
                responseMimeType: "application/json",
              },
            },
      ),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
