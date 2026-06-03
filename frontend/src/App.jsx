import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import OrderHistory from "./pages/OrderHistory";
import Login from "./pages/LoginTemp.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode
      ? "dark-mode"
      : "light-mode";
  }, [darkMode]);

  return (
    <BrowserRouter>

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <Dashboard />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <Products />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <Orders />
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-history"
          element={
            <ProtectedRoute>
              <div className="container mt-4">
                <OrderHistory />
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;