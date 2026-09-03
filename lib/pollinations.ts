import 'server-only';

type RecipeImprovement = 'detailed' | 'emojis' | 'fix';

const recipeImprovementInstructions: Record<RecipeImprovement, string> = {
  detailed:
    'Rewrite the recipe in more detail. Do not change ingredients, quantities, cooking times or temperatures.',
  emojis: 'Add appropriate emojis to the recipe. Do not change its meaning or cooking instructions.',
  fix: 'Fix grammar and spelling mistakes only. Do not change the meaning or any recipe data.',
};

function getAuthorizationHeaders() {
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    throw new Error('Pollinations API is not configured.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function generateMealImage(title: string, summary: string): Promise<string> {
  const prompt = `Food photography of ${title}. ${summary}. Studio lighting, realistic textures, appetizing composition.`;
  const response = await fetch('https://gen.pollinations.ai/v1/images/generations', {
    method: 'POST',
    headers: getAuthorizationHeaders(),
    body: JSON.stringify({
      prompt,
      model: 'flux',
      n: 1,
      size: '1024x1024',
      quality: 'medium',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    throw new Error(`Image generation service error (${response.status}).`);
  }

  const data = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const base64Image = data.data?.[0]?.b64_json;

  if (!base64Image) {
    throw new Error('Image generation returned an empty file.');
  }

  return `data:image/jpeg;base64,${base64Image}`;
}

export async function improveRecipeText(
  recipe: string,
  improvement: RecipeImprovement,
): Promise<string> {
  const response = await fetch('https://gen.pollinations.ai/text', {
    method: 'POST',
    headers: getAuthorizationHeaders(),
    body: JSON.stringify({
      model: 'openai',
      messages: [
        {
          role: 'user',
          content: `${recipeImprovementInstructions[improvement]} Recipe: ${recipe}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to improve recipe.');
  }

  return response.text();
}