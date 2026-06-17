import { useEffect, useState } from "react";
import API from "../services/api";

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`gs-toast ${type}`} role="alert">
      <span>{type === "success" ? "✅" : "❌"}</span>
      {msg}
    </div>
  );
}

function Orders() {
  const [products, setProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderItems, setOrderItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  const username = sessionStorage.getItem("username") || "";

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    API.get("/getProducts").then((r) => setProducts(r.data)).catch(console.error);
    // Pre-fill customer name with logged-in user
    setCustomerName(username);
  }, [username]);

  const selectedProductObj = products.find(
    (p) => p.product_id === Number(selectedProduct)
  );

  const addItem = () => {
    if (!selectedProduct || quantity <= 0) {
      showToast("Please select a product and quantity", "error");
      return;
    }
    const product = selectedProductObj;
    const itemTotal = product.price_per_unit * Number(quantity);

    setOrderItems((prev) => [
      ...prev,
      {
        product_id: product.product_id,
        name: product.name,
        quantity: Number(quantity),
        uom_name: product.uom_name,
        total_price: itemTotal,
      },
    ]);
    setTotal((t) => t + itemTotal);
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (index) => {
    const item = orderItems[index];
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
    setTotal((t) => t - item.total_price);
  };

  const placeOrder = async () => {
    if (!customerName.trim()) { showToast("Enter customer name", "error"); return; }
    if (orderItems.length === 0) { showToast("Add at least one product", "error"); return; }

    setPlacing(true);
    try {
      const response = await API.post("/insertOrder", {
        customer_name: customerName,
        total,
        order_details: orderItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          total_price: item.total_price,
        })),
      });

      showToast(`Order #${response.data.order_id} placed successfully!`);
      setCustomerName(username);
      setOrderItems([]);
      setTotal(0);
      setSelectedProduct("");
      setQuantity(1);
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Failed to place order",
        "error"
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: 8 }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 20 }}>New Order</h1>
          <p className="page-subtitle" style={{ fontSize: 13 }}>Build and place a customer order</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* LEFT — Order Builder */}
        <div>
          <div className="gs-card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Order Builder</h3>

            {/* Customer Details */}
            <div className="gs-form-group" style={{ marginBottom: 14 }}>
              <label className="gs-label">Customer Name</label>
              <input
                id="order-customer-name"
                className="gs-input"
                placeholder="Enter customer name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            {/* Product Selection and Quantity side-by-side */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 14 }}>
              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Select Product</label>
                <div className="gs-select-wrapper">
                  <select
                    id="order-product-select"
                    className="gs-select"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Choose a product…</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.name} — ₹{p.price_per_unit}/{p.uom_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gs-form-group" style={{ marginBottom: 0 }}>
                <label className="gs-label">Quantity</label>
                <input
                  id="order-quantity"
                  type="number"
                  className="gs-input"
                  value={quantity}
                  min="1"
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            {/* Selected product and price preview side-by-side */}
            {selectedProductObj && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}>
                <div style={{
                  background: "var(--accent-green-soft)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--accent-green)",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center"
                }}>
                  ₹{selectedProductObj.price_per_unit} per {selectedProductObj.uom_name}
                </div>
                {quantity > 0 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    fontSize: 13,
                  }}>
                    <span style={{ color: "var(--text-secondary)" }}>Item Total</span>
                    <strong style={{ color: "var(--accent-green)" }}>
                      ₹{(selectedProductObj.price_per_unit * Number(quantity)).toFixed(2)}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <button className="btn-primary-gs w-full" style={{ justifyContent: "center", padding: "10px" }} onClick={addItem}>
              ＋ Add to Order
            </button>
          </div>
        </div>

        {/* RIGHT — Order Summary */}
        <div>
          <div className="gs-card" style={{ position: "sticky", top: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
              Order Summary
              {orderItems.length > 0 && (
                <span style={{
                  marginLeft: 10, background: "var(--accent-green)",
                  color: "#fff", fontSize: 11.5, fontWeight: 600,
                  padding: "2px 9px", borderRadius: 99,
                }}>
                  {orderItems.length}
                </span>
              )}
            </h3>

            {orderItems.length === 0 ? (
              <div className="gs-empty" style={{ padding: "36px 20px" }}>
                <div className="gs-empty-icon">🛒</div>
                <div className="gs-empty-title">Cart is empty</div>
                <div className="gs-empty-desc">Select products and add them to the order</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16 }}>
                  {orderItems.map((item, i) => (
                    <div key={i} className="order-item-row" style={{ padding: "8px 12px", marginBottom: "6px" }}>
                      <div className="order-item-name" style={{ fontSize: "13.5px" }}>{item.name}</div>
                      <div className="order-item-qty" style={{ fontSize: "12.5px" }}>{item.quantity} {item.uom_name}</div>
                      <div className="order-item-price" style={{ fontSize: "13.5px" }}>₹{item.total_price}</div>
                      <button
                        className="btn-icon-gs"
                        onClick={() => removeItem(i)}
                        title="Remove item"
                        style={{ color: "var(--accent-rose)", border: "none", background: "transparent", width: "24px", height: "24px", fontSize: "12px", padding: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="gs-divider" style={{ margin: "12px 0" }} />

                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", marginBottom: 16,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    Total Amount
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-green)", fontFamily: "var(--font-display)" }}>
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <button
                  id="place-order-btn"
                  className="btn-primary-gs w-full"
                  style={{
                    justifyContent: "center", padding: "10px",
                    fontSize: 14, opacity: placing ? 0.7 : 1,
                    cursor: placing ? "not-allowed" : "pointer",
                  }}
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? "Placing order…" : "✓ Place Order"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;