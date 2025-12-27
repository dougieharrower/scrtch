import { sampleRecipes } from "./sampleRecipes";
import type { Recipe } from "./sampleRecipes";

let recipes: Recipe[] = [...sampleRecipes];

export function getRecipes() {
  return recipes;
}

export function getRecipeById(id: string) {
  return recipes.find((r) => r.id === id);
}

export function addRecipe(r: Recipe) {
  recipes = [r, ...recipes];
}

export function updateRecipe(updated: Recipe) {
  recipes = recipes.map((r) => (r.id === updated.id ? updated : r));
}

/**
 * Given ANY recipe, return the root/original recipe (if we have it in-memory).
 */
export function getRootRecipe(recipe: Recipe) {
  const rootId = recipe.rootId ?? recipe.id;
  return getRecipeById(rootId);
}
