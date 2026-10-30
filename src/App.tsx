import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./assets/pages/LogIn";
import Register from "./assets/pages/Register";
import ForgotPassword from "./assets/pages/ForgotPassword";
import Catalog from "./assets/pages/catalog/Catalog";
import ProductPage from "./assets/pages/catalog/ProductPage";
import CartPage from "./assets/pages/cartPage";
import CheckoutPage from "./assets/pages/checkoutPage";
import ConfirmPage from "./assets/pages/confirmPage";
import OrderPage from "./assets/pages/orderPage";
import { RequireAuth } from "./auth";
import ProfilePage from "./assets/pages/profilePage";

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
      <Route
        path="/checkout"
        element={
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        }
      />
      <Route
        path="/checkout/confirm/:orderId"
        element={
          <RequireAuth>
            <ConfirmPage />
          </RequireAuth>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <RequireAuth>
            <OrderPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
