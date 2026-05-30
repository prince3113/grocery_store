import { useEffect, useState } from "react";
import API from "../services/api";

function Orders() {
  const [products, setProducts] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
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

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) {
      alert("Please select product and quantity");
      return;
    }
  
    const product = products.find(
      (p) => p.product_id === Number(selectedProduct)
    );
  
    const itemTotal =
      product.price_per_unit * Number(quantity);
  
    const newItem = {
      product_id: product.product_id,
      name: product.name,
      quantity: Number(quantity),
      uom_name: product.uom_name,
      total_price: itemTotal,
    };
  
    setOrderItems([...orderItems, newItem]);
    setTotal(total + itemTotal);
  
    setSelectedProduct("");
    setQuantity(1);
  };

  const placeOrder = async () => {
    if (!customerName) {
      alert("Enter customer name");
      return;
    }

    if (orderItems.length === 0) {
      alert("Add at least one product");
      return;
    }

    const payload = {
      customer_name: customerName,
      total: total,
      order_details: orderItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.total_price,
      })),
    };

    try {
      const response = await API.post(
        "/insertOrder",
        payload
      );

      alert(
        `Order Placed Successfully! Order ID: ${response.data.order_id}`
      );

      setCustomerName("");
      setOrderItems([]);
      setTotal(0);
      setSelectedProduct("");
      setQuantity(1);
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Create Order</h2>

      <div className="card p-4 shadow">
        <div className="mb-3">
          <label className="form-label">
            Customer Name
          </label>

          <input
            type="text"
            className="form-control"
            value={customerName}
            onChange={(e) =>
              setCustomerName(e.target.value)
            }
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            Product
          </label>

          <select
            className="form-select"
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(e.target.value)
            }
          >
            <option value="">
              Select Product
            </option>

            {products.map((product) => (
              <option
                key={product.product_id}
                value={product.product_id}
              >
                {product.name} - ₹
                {product.price_per_unit}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">
            Quantity
          </label>

          <input
            type="number"
            className="form-control"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
          />
        </div>

        <button
          className="btn btn-success"
          onClick={addItem}
        >
          Add Item
        </button>
      </div>

      <div className="mt-4">
        
  <h4>Order Summary</h4>

  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Product</th>
        <th>Quantity</th>
        <th>Unit</th>
        <th>Total Price</th>
      </tr>
    </thead>

    <tbody>
      {orderItems.map((item, index) => (
        <tr key={index}>
          <td>{item.name}</td>
          <td>{item.quantity}</td>
          <td>{item.uom_name}</td>
          <td>₹{item.total_price}</td>
        </tr>
      ))}
    </tbody>
  </table>

  <h3>Total: ₹{total}</h3>

  <button
    className="btn btn-primary mt-3"
    onClick={placeOrder}
  >
    Place Order
  </button>
</div>
    </div>
  );
}

export default Orders;