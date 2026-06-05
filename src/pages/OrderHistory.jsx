import { useEffect, useState, Fragment } from "react";
import API from "../services/api";

function OrderHistory() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get("/getAllorders")
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = [...orders]
    .sort((a, b) => b.order_id - a.order_id)
    .filter((o) =>
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      String(o.order_id).includes(search)
    );

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", fontSize:28 }}>
      🌿
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Order History</h1>
          <p className="page-subtitle">{orders.length} orders · ₹{totalRevenue.toLocaleString()} total revenue</p>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 14,
        marginBottom: 24,
      }}>
        {[
          { label: "Total Orders",   value: orders.length,                        icon: "🧾", color: "var(--accent-blue)"  },
          { label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString()}`,  icon: "💰", color: "var(--accent-green)" },
          { label: "Unique Customers",
            value: new Set(orders.map((o) => o.customer_name)).size,
            icon: "👤", color: "var(--accent-amber)" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            boxShadow: "var(--shadow-xs)",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily:"var(--font-display)" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="gs-search-wrap mb-16" style={{ maxWidth: 360 }}>
        <span className="search-icon">🔍</span>
        <input
          className="gs-input"
          placeholder="Search by customer or order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table / Cards */}
      {filtered.length === 0 ? (
        <div className="gs-card">
          <div className="gs-empty">
            <div className="gs-empty-icon">📋</div>
            <div className="gs-empty-title">No orders found</div>
            <div className="gs-empty-desc">Try a different search term</div>
          </div>
        </div>
      ) : (
        <div className="gs-table-wrapper">
          <table className="gs-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date &amp; Time</th>
                <th>Items</th>
                <th>Total</th>
                <th style={{ textAlign:"center" }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <Fragment key={order.order_id}>
                  <tr
                    key={order.order_id}
                    style={{ cursor:"pointer" }}
                    onClick={() =>
                      setExpanded(expanded === order.order_id ? null : order.order_id)
                    }
                  >
                    <td>
                      <span style={{
                        background: "var(--bg-secondary)",
                        padding: "3px 10px",
                        borderRadius: 99,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}>
                        #{order.order_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width: 32, height: 32,
                          background: "var(--accent-green-soft)",
                          borderRadius: "50%",
                          display: "flex", alignItems:"center", justifyContent:"center",
                          fontSize: 13, fontWeight: 700, color: "var(--accent-green)",
                          flexShrink: 0, textTransform: "uppercase",
                        }}>
                          {order.customer_name.slice(0,2)}
                        </div>
                        <span style={{ fontWeight:600 }}>{order.customer_name}</span>
                      </div>
                    </td>
                    <td style={{ color:"var(--text-secondary)", fontSize:13.5 }}>
                      {new Date(order.datetime).toLocaleDateString("en-IN", {
                        day:"numeric", month:"short", year:"numeric"
                      })}
                      <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                        {new Date(order.datetime).toLocaleTimeString("en-IN", {
                          hour:"2-digit", minute:"2-digit"
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: "var(--accent-blue-soft)",
                        color: "var(--accent-blue)",
                        borderRadius: 99,
                        padding: "3px 10px",
                        fontSize: 12.5, fontWeight:500,
                      }}>
                        {order.order_details?.length || 0} item{order.order_details?.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td style={{ fontWeight:700, fontSize:15, color:"var(--accent-green)" }}>
                      ₹{order.total.toLocaleString()}
                    </td>
                    <td style={{ textAlign:"center" }}>
                      <span style={{
                        fontSize: 13, color:"var(--accent-green)",
                        fontWeight: 500, userSelect:"none",
                      }}>
                        {expanded === order.order_id ? "▲ Hide" : "▼ Show"}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expanded === order.order_id && (
                    <tr key={`exp-${order.order_id}`}>
                      <td colSpan={6} style={{ background:"var(--bg-secondary)", padding:"16px 20px" }}>
                        <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text-secondary)", marginBottom:10 }}>
                          Order Items
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                          {order.order_details?.map((item, i) => (
                            <div key={i} style={{
                              display:"flex", alignItems:"center", justifyContent:"space-between",
                              background:"var(--bg-card)",
                              borderRadius:"var(--radius-md)",
                              padding:"10px 16px",
                              border:"1px solid var(--border-soft)",
                              gap:12,
                            }}>
                              <div>
                                <div style={{ fontWeight:600, fontSize:14, color:"var(--text-primary)" }}>
                                  {item.product_name}
                                </div>
                                <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:2 }}>
                                  ₹{item.price_per_unit} × {item.quantity}
                                </div>
                              </div>
                              <div style={{ fontWeight:700, color:"var(--accent-green)", fontSize:15 }}>
                                ₹{item.total_price}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order total row */}
                        <div style={{
                          display:"flex", justifyContent:"flex-end",
                          marginTop:12, paddingTop:12,
                          borderTop:"1px solid var(--border-soft)",
                        }}>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:2 }}>Order Total</div>
                            <div style={{ fontSize:20, fontWeight:700, color:"var(--accent-green)", fontFamily:"var(--font-display)" }}>
                              ₹{order.total.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-muted-gs text-sm" style={{ marginTop:12 }}>
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </div>
  );
}

export default OrderHistory;