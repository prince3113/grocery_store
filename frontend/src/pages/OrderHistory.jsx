import { useEffect, useState } from "react";
import API from "../services/api";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/getAllorders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      <h2 className="mb-4">Order History</h2>

      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
        
  {[...orders]
    .sort((a, b) => b.order_id - a.order_id)
    .map((order) => (
            <tr key={order.order_id}>
              <td>{order.order_id}</td>
              <td>{order.customer_name}</td>
              <td>
  {new Date(order.datetime).toLocaleString()}
</td>
              <td>₹{order.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderHistory;