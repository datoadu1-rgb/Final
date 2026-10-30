import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "./auth";

const Login = lazy(() => import("./assets/pages/LogIn"));
const Register = lazy(() => import("./assets/pages/Register"));
const ForgotPassword = lazy(() => import("./assets/pages/ForgotPassword"));

const Catalog = lazy(() => import("./assets/pages/catalog/Catalog"));
const ProductPage = lazy(() => import("./assets/pages/catalog/ProductPage"));

const CartPage = lazy(() => import("./assets/pages/cartPage"));
const CheckoutPage = lazy(() => import("./assets/pages/checkoutPage"));
const ConfirmPage = lazy(() => import("./assets/pages/confirmPage"));
const OrderPage = lazy(() => import("./assets/pages/orderPage"));

const ProfilePage = lazy(() => import("./assets/pages/profilePage"));

function App() {
  return (
    <Suspense fallback={<p>Loading page...</p>}>
      <Routes>
        <Route path="/" element={<Navigate to="/catalog" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/catalog" element={<Catalog />} />
        <Route path="/product/:slug" element={<ProductPage />} />

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
    </Suspense>
  );
}

export default App;
