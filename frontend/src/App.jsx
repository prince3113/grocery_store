import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import OrderHistory from "./pages/OrderHistory";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="container mt-4">
      <Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/products" element={<Products />} />
  <Route path="/orders" element={<Orders />} />
  <Route
    path="/order-history"
    element={<OrderHistory />}
  />
</Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;