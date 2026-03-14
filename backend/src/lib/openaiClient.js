export async function generateWithOpenAI({ apiKey, model, instructions, prompt }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: prompt,
      instructions,
      text: {
        format: {
          type: "text",
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.output_text;

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return text;
}
