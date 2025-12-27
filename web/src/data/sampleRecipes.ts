export type RecipeVisibility = "private" | "unlisted" | "public";

export type StepTimer = {
  label: string;
  seconds: number;
  kind?: "countdown" | "in"; // "in" = start later suggestion
};

export type RecipeStep = {
  text: string;
  timer?: StepTimer;
};

export type RecipeIngredient = {
  name: string;
  amount?: number;
  unit?: string;
  note?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  authorName?: string;

  visibility: RecipeVisibility;

  // Fork / lineage
  parentId?: string;
  forkReason?: string;

  tags: string[];
  servingsDefault: number;

  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  rootId?: string; // id of the original recipe in the fork lineage

  changes?: {
    ingredientsAdded?: string[];
    ingredientsRemoved?: string[];
    stepsChanged?: string[];
  };
};

export const sampleRecipes: Recipe[] = [
  {
    id: "cheesy-christmas-tree",
    title: "Cheesy Christmas Tree",
    authorName: "Breanna (imported)",
    visibility: "public",
    description:
      "A holiday pull-apart that looks like a tree. Marinara is non-negotiable.",
    tags: ["holiday", "appetizer", "easy", "vegetarian"],
    servingsDefault: 8,
    ingredients: [
      {
        name: "Refrigerated pizza dough",
        amount: 2,
        unit: "can",
        note: "2 tubes (Pillsbury-style)",
      },
      {
        name: "Mozzarella string cheese",
        amount: 8,
        unit: "stick",
        note: "Cut each into 3–4 chunks",
      },
      { name: "Egg", amount: 1 },
      { name: "Water", amount: 1, unit: "tbsp" },
      { name: "Butter", amount: 3, unit: "tbsp", note: "melted" },
      { name: "Garlic", amount: 2, unit: "clove", note: "minced" },
      { name: "Italian seasoning", amount: 1, unit: "tbsp" },
      { name: "Grated parmesan", amount: 4, unit: "tbsp" },
      {
        name: "Fresh rosemary",
        amount: 3,
        unit: "sprig",
        note: "optional, for the tree look",
      },
      {
        name: "Marinara sauce",
        amount: 0.5,
        unit: "cup",
        note: "for dipping",
      },
    ],
    steps: [
      { text: "Preheat oven to 400°F. Line a baking sheet with parchment." },
      {
        text: "Slice mozzarella sticks into bite-sized chunks.",
      },
      {
        text: "Unroll pizza dough and cut into ~2-inch squares.",
      },
      {
        text: "Wrap each cheese chunk in dough and pinch seams closed.",
      },
      {
        text: "Arrange dough balls into a Christmas tree shape on the baking sheet.",
      },
      {
        text: "Whisk egg and water together; brush over dough.",
      },
      {
        text: "Bake until golden brown.",
        timer: { label: "Bake", seconds: 25 * 60 },
      },
      {
        text: "Mix melted butter, garlic, and Italian seasoning.",
      },
      {
        text: "Brush butter mixture over hot rolls and sprinkle with parmesan.",
      },
      {
        text: "Decorate with rosemary sprigs and serve warm with marinara.",
      },
    ],
  },

  {
    id: "cinnamon-rolls-base",
    title: "Cinnamon Rolls (Base Recipe)",
    visibility: "private",
    description:
      "Soft, gooey cinnamon rolls with Make Mode timers for rises and icing timing.",
    tags: ["baking", "breakfast", "sweet"],
    servingsDefault: 12,
    ingredients: [
      {
        name: "Whole milk",
        amount: 0.5,
        unit: "cup",
        note: "warm, not hot (about 105°F)",
      },
      { name: "Instant yeast", amount: 2.25, unit: "tsp" },
      { name: "Granulated sugar", amount: 0.25, unit: "cup" },
      { name: "Eggs", amount: 2, note: "room temperature" },
      { name: "Unsalted butter", amount: 0.5, unit: "cup", note: "melted" },
      { name: "All-purpose flour", amount: 4, unit: "cup" },
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Brown sugar", amount: 1, unit: "cup", note: "for filling" },
      { name: "Cinnamon", amount: 2, unit: "tbsp" },
    ],
    steps: [
      {
        text: "Mix warm milk, yeast, and sugar. Let bloom briefly.",
        timer: { label: "Yeast bloom", seconds: 5 * 60 },
      },
      {
        text: "Mix in eggs, butter, salt, and flour. Knead until smooth.",
      },
      {
        text: "Cover dough and let rise until doubled.",
        timer: { label: "First rise", seconds: 90 * 60 },
      },
      {
        text: "Roll dough into rectangle. Spread filling and roll tightly.",
      },
      {
        text: "Cut into rolls and arrange in baking dish.",
      },
      {
        text: "Let rolls rise until puffy.",
        timer: { label: "Second rise", seconds: 45 * 60 },
      },
      {
        text: "Bake until lightly golden.",
        timer: { label: "Bake", seconds: 25 * 60 },
      },
      {
        text: "Prepare icing so it’s ready when rolls come out.",
        timer: {
          label: "Start icing in…",
          seconds: 20 * 60,
          kind: "in",
        },
      },
      {
        text: "Ice warm rolls and serve immediately.",
      },
    ],
  },

  {
    id: "cinnamon-rolls-lower-sugar-nutfree",
    title: "Cinnamon Rolls (Lower Sugar, Nut-Free)",
    visibility: "unlisted",
    parentId: "cinnamon-rolls-base",
    forkReason: "Reduced sugar and explicitly nut-free for group baking.",
    description:
      "Fork of the base recipe with less sugar in the filling and icing.",
    tags: ["baking", "fork", "nut-free"],
    servingsDefault: 12,
    ingredients: [
      {
        name: "Base recipe ingredients",
        note: "Use all ingredients from parent recipe unless noted below.",
      },
      {
        name: "Brown sugar (filling)",
        amount: 0.5,
        unit: "cup",
        note: "reduced from 1 cup",
      },
    ],
    steps: [
      {
        text: "Follow all steps from the base cinnamon roll recipe.",
      },
      {
        text: "Use reduced sugar amounts for filling and icing.",
      },
    ],
  },
];
