import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./assets/pages/LogIn";
import Register from "./assets/pages/Register";
import ForgotPassword from "./assets/pages/ForgotPassword";
import Catalog from "./assets/pages/catalog/Catalog";
import ProductPage from "./assets/pages/catalog/ProductPage";
import CartPage from "./assets/pages/cartPage";
import { RequireAuth } from "./auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/product/:slug" element={<ProductPage />} />
      {/* requireAuth wrapped kidvaze */}
      <Route
        path="/cart"
        element={
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
