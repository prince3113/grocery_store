import { useEffect, useState, Fragment } from "react";
import API from "../services/api";

const STATUS_COLOR = { bg: "#ddeee2", color: "#4a7c59" };

export default function CustomerOrders() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState(null);

  const username = sessionStorage.getItem("username") || "";

  useEffect(() => {
    API.get("/getAllorders")
      .then((r) => {
        // Filter only this customer's orders
        const mine = r.data.filter(
          (o) => o.customer_name.toLowerCase() === username.toLowerCase()
        );
        setOrders(mine);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  const filtered = [...orders]
    .sort((a, b) => b.order_id - a.order_id)
    .filter((o) =>
      String(o.order_id).includes(search) ||
      new Date(o.datetime).toLocaleDateString("en-IN").includes(search)
    );

  const totalSpent     = orders.reduce((s, o) => s + o.total, 0);
  const totalItems     = orders.reduce((s, o) => s + (o.order_details?.length || 0), 0);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", fontSize:30 }}>
      🌿
    </div>
  );

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Your complete purchase history</p>
        </div>
        <a
          href="/shop"
          style={{
            display:"flex", alignItems:"center", gap:8,
            background:"var(--accent-green)", color:"#fff",
            borderRadius:"var(--radius-md)", padding:"10px 18px",
            textDecoration:"none", fontSize:14, fontWeight:600,
            fontFamily:"var(--font-main)", transition:"var(--transition)",
          }}
        >
          🛒 Continue Shopping
        </a>
      </div>

      {/* Summary Cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))",
        gap:14, marginBottom:24,
      }}>
        {[
          { icon:"🧾", label:"Orders Placed",  value: orders.length,                       color:"var(--accent-blue)"  },
          { icon:"💰", label:"Total Spent",     value: `₹${totalSpent.toLocaleString()}`,   color:"var(--accent-green)" },
          { icon:"📦", label:"Items Ordered",   value: totalItems,                          color:"var(--accent-amber)" },
        ].map((s) => (
          <div key={s.label} style={{
            background:"var(--bg-card)", border:"1px solid var(--border-soft)",
            borderRadius:"var(--radius-lg)", padding:"18px 20px",
            boxShadow:"var(--shadow-xs)",
          }}>
            <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontSize:11.5, color:"var(--text-muted)", fontWeight:600,
              textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>
              {s.label}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:s.color, fontFamily:"var(--font-display)" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="gs-search-wrap mb-16" style={{ maxWidth:320 }}>
        <span className="search-icon">🔍</span>
        <input
          className="gs-input"
          placeholder="Search by order ID or date…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* No orders state */}
      {filtered.length === 0 ? (
        <div className="gs-card">
          <div className="gs-empty" style={{ padding:"56px 20px" }}>
            <div className="gs-empty-icon">🛒</div>
            <div className="gs-empty-title">
              {orders.length === 0 ? "No orders yet" : "No results found"}
            </div>
            <div className="gs-empty-desc">
              {orders.length === 0
                ? "Start shopping and your orders will appear here"
                : "Try a different search term"}
            </div>
            {orders.length === 0 && (
              <a
                href="/shop"
                style={{
                  display:"inline-block", marginTop:18,
                  background:"var(--accent-green)", color:"#fff",
                  padding:"10px 24px", borderRadius:"var(--radius-md)",
                  textDecoration:"none", fontWeight:600, fontSize:14,
                }}
              >
                Browse Products →
              </a>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map((order) => (
            <div
              key={order.order_id}
              style={{
                background:"var(--bg-card)",
                border:"1px solid var(--border-soft)",
                borderRadius:"var(--radius-lg)",
                boxShadow:"var(--shadow-xs)",
                overflow:"hidden",
                transition:"var(--transition)",
              }}
            >
              {/* Order header row */}
              <div
                style={{
                  display:"flex", alignItems:"center",
                  justifyContent:"space-between",
                  padding:"16px 20px", cursor:"pointer",
                  gap:12, flexWrap:"wrap",
                }}
                onClick={() =>
                  setExpanded(expanded === order.order_id ? null : order.order_id)
                }
              >
                {/* Left info */}
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  {/* Status dot */}
                  <div style={{
                    width:42, height:42, borderRadius:"var(--radius-md)",
                    background:"var(--accent-green-soft)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:18, flexShrink:0,
                  }}>
                    🧾
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>
                      Order #{order.order_id}
                    </div>
                    <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:2 }}>
                      {new Date(order.datetime).toLocaleDateString("en-IN", {
                        day:"numeric", month:"long", year:"numeric",
                      })}
                      {" · "}
                      {new Date(order.datetime).toLocaleTimeString("en-IN", {
                        hour:"2-digit", minute:"2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {/* Right info */}
                <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                  <div>
                    <div style={{ fontSize:11.5, color:"var(--text-muted)", marginBottom:2 }}>Items</div>
                    <div style={{
                      background:"var(--accent-blue-soft)", color:"var(--accent-blue)",
                      borderRadius:99, padding:"3px 10px",
                      fontSize:12.5, fontWeight:600, textAlign:"center",
                    }}>
                      {order.order_details?.length || 0}
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11.5, color:"var(--text-muted)", marginBottom:2 }}>Total</div>
                    <div style={{
                      fontWeight:700, fontSize:18, color:"var(--accent-green)",
                      fontFamily:"var(--font-display)",
                    }}>
                      ₹{order.total.toLocaleString()}
                    </div>
                  </div>
                  <div style={{
                    fontSize:18, color:"var(--accent-green)",
                    transform: expanded === order.order_id ? "rotate(180deg)" : "rotate(0deg)",
                    transition:"transform 0.22s",
                  }}>
                    ▾
                  </div>
                </div>
              </div>

              {/* Expanded items */}
              {expanded === order.order_id && (
                <div style={{
                  borderTop:"1px solid var(--border-soft)",
                  padding:"16px 20px",
                  background:"var(--bg-secondary)",
                  animation:"fadeInAnim 0.2s ease",
                }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text-muted)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                    Items Ordered
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {order.order_details?.map((item, i) => (
                      <div key={i} style={{
                        display:"flex", alignItems:"center",
                        justifyContent:"space-between",
                        background:"var(--bg-card)",
                        borderRadius:"var(--radius-md)",
                        padding:"12px 16px",
                        border:"1px solid var(--border-soft)",
                        gap:12,
                      }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:14, color:"var(--text-primary)" }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize:12.5, color:"var(--text-muted)", marginTop:2 }}>
                            ₹{item.price_per_unit} × {item.quantity} unit{item.quantity !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={{
                          fontWeight:700, fontSize:15, color:"var(--accent-green)",
                          whiteSpace:"nowrap",
                        }}>
                          ₹{item.total_price}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order total */}
                  <div style={{
                    display:"flex", justifyContent:"flex-end",
                    marginTop:14, paddingTop:14,
                    borderTop:"1px solid var(--border-soft)",
                    alignItems:"baseline", gap:12,
                  }}>
                    <span style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:500 }}>
                      Order Total
                    </span>
                    <span style={{
                      fontSize:22, fontWeight:700, color:"var(--accent-green)",
                      fontFamily:"var(--font-display)",
                    }}>
                      ₹{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-muted-gs text-sm" style={{ marginTop:14 }}>
          Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
