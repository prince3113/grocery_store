import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Sidebar        from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard      from "./pages/Dashboard";
import Products       from "./pages/Products";
import Orders         from "./pages/Orders";
import OrderHistory   from "./pages/OrderHistory";
import Login          from "./pages/Login";
import CustomerShop   from "./pages/CustomerShop";
import CustomerOrders from "./pages/CustomerOrders";

import "./index.css";

// Inner component so useLocation works inside BrowserRouter
function AppContent({ darkMode, setDarkMode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const showSidebar = !isLoginPage && !!token;

  return (
    <div className="app-layout">
      {showSidebar && (
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
      )}

      <main
        className="main-content"
        style={!showSidebar ? { marginLeft: 0, padding: 0 } : undefined}
      >
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Root route: dynamically redirects/loads the role-appropriate home */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {role === "admin" ? <Dashboard /> : <CustomerShop />}
              </ProtectedRoute>
            }
          />

          {/* Admin-only Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRole="admin">
                <Products />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRole="admin">
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-history"
            element={
              <ProtectedRoute allowedRole="admin">
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Customer-only Routes */}
          <Route
            path="/shop"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerShop />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRole="customer">
                <CustomerOrders />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </BrowserRouter>
  );
}

export default App;