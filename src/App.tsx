import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./assets/pages/LogIn";
import Register from "./assets/pages/Register";
import ForgotPassword from "./assets/pages/ForgotPassword";
import Catalog from "./assets/pages/catalog/Catalog";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/catalog" element={<Catalog />} />
      {/* requireAuth wrapped kidvaze */}
    </Routes>
  );
}

export default App;
