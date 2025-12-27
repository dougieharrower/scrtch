import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RecipesList from "./pages/RecipesList";
import RecipeDetail from "./pages/RecipeDetail";
import NewRecipe from "./pages/NewRecipe";
import MakeMode from "./pages/MakeMode";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/recipes" replace />} />
        <Route path="/recipes" element={<RecipesList />} />
        <Route path="/recipes/new" element={<NewRecipe />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/make" element={<MakeMode />} />
        <Route
          path="*"
          element={<div style={{ padding: 24 }}>Not found.</div>}
        />
      </Routes>
    </BrowserRouter>
  );
}
