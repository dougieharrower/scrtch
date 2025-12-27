import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import RecipesList from "./pages/RecipesList";
import RecipeDetail from "./pages/RecipeDetail";
import NewRecipe from "./pages/NewRecipe";
import MakeMode from "./pages/MakeMode";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import MyRecipeBook from "./pages/MyRecipeBook";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/recipes" replace />} />

          {/* Public */}
          <Route path="/recipes" element={<RecipesList />} />
          <Route path="/recipes/new" element={<NewRecipe />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/make" element={<MakeMode />} />

          {/* Logged-in areas */}
          <Route path="/me/book" element={<MyRecipeBook />} />
          <Route path="/profile" element={<Profile />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          <Route
            path="*"
            element={<div style={{ padding: 24 }}>Not found.</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
