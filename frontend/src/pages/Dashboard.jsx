import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    API.get("/getProducts")
      .then((res) => {
        setProductCount(res.data.length);
      })
      .catch((err) => console.log(err));

    API.get("/getAllorders")
      .then((res) => {
        setOrderCount(res.data.length);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Products</h5>
              <h1>{productCount}</h1>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card text-center shadow">
            <div className="card-body">
              <h5 className="card-title">Orders</h5>
              <h1>{orderCount}</h1>
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