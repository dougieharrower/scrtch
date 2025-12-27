import type { Recipe } from "../data/sampleRecipes";

export function makeForkId(parentId: string) {
  return `${parentId}-fork-${Math.random().toString(36).slice(2, 9)}`;
}

type ForkChoice = "branch" | "original";

/**
 * Fork rules:
 * - If forking "branch": parentId = parent.id
 * - If forking "original": parentId = original.id (the true base recipe)
 * - rootId is ALWAYS the original recipe's id
 * - We do NOT mutate title (no "(Fork)" spam)
 */
export function forkRecipe(
  parent: Recipe,
  opts?: {
    choice?: ForkChoice;
    original?: Recipe; // required if choice === "original" and parent is a fork
    overrides?: Partial<Recipe>;
  }
): Recipe {
  const choice: ForkChoice = opts?.choice ?? "branch";

  const baseForFork =
    choice === "original" && opts?.original ? opts.original : parent;

  const rootId = baseForFork.rootId ?? baseForFork.id;

  return {
    ...baseForFork,
    id: makeForkId(baseForFork.id),
    visibility: "private",
    parentId: baseForFork.id,
    rootId,
    forkReason: "Forked in Scrtch",
    ...opts?.overrides,
  };
}
