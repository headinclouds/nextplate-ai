'use server';

import { improveRecipeText } from '@/lib/pollinations';

export async function improveRecipe(recipe: string, action: 'detailed' | 'emojis' | 'fix') {
  return improveRecipeText(recipe, action);
}
