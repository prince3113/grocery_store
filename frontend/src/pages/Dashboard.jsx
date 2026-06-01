import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [Revenue, setRevenue] = useState(0);

  useEffect(() => {
    API.get("/dashboardStats")
      .then((res) => {
        setProductCount(res.data.total_products);
        setOrderCount(res.data.total_orders);
        setRevenue(res.data.total_revenue);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
  <div className="col-md-4 mb-3">
    <div className="card shadow border-0">
      <div className="card-body text-center">
        <i className="bi bi-box-seam fs-1 text-success"></i>
        <h5 className="mt-2">Total Products</h5>
        <h1>{productCount}</h1>
      </div>
    </div>
  </div>

  <div className="col-md-4 mb-3">
    <div className="card shadow border-0">
      <div className="card-body text-center">
        <i className="bi bi-cart-check fs-1 text-primary"></i>
        <h5 className="mt-2">Total Orders</h5>
        <h1>{orderCount}</h1>
      </div>
    </div>
  </div>
  <div className="col-md-4 mb-3">
  <div className="card shadow border-0">
    <div className="card-body text-center">
      <i className="bi bi-currency-rupee fs-1 text-warning"></i>
      <h5 className="mt-2">Total Revenue</h5>
      <h1>₹{Revenue}</h1>
    </div>
  </div>
</div>
</div>



      <div className="card mt-4 shadow">
        <div className="card-body">
          <h4>Welcome to Grocery Store Management System</h4>
          <p>
            Manage products, create orders, track inventory and monitor
            business operations from one dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;