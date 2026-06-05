import { useEffect, useState } from "react";
import API from "../services/api";

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const CATEGORY_COLORS = {
  Fruits:      { bg: "#ddeee2", color: "#4a7c59" },
  Dairy:       { bg: "#e3eaf5", color: "#6b8cba" },
  Grains:      { bg: "#faeee3", color: "#c9884c" },
  Electronics: { bg: "#fdf3dc", color: "#c9a84c" },
  Grocery:     { bg: "#e8f0ea", color: "#6aab7a" },
};

function StatCard({ icon, label, value, color, prefix = "" }) {
  return (
    <div className="stat-card fade-in">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{prefix}{value.toLocaleString()}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats,    setStats]    = useState({ total_products: 0, total_orders: 0, total_revenue: 0 });
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  const username = sessionStorage.getItem("username") || "there";
  const role     = sessionStorage.getItem("role");

  const productCount = useCounter(stats.total_products);
  const orderCount   = useCounter(stats.total_orders);
  const revenue      = useCounter(Math.round(stats.total_revenue));

  useEffect(() => {
    Promise.all([
      API.get("/dashboardStats"),
      API.get("/getProducts"),
      API.get("/getAllorders"),
    ])
      .then(([s, p, o]) => {
        setStats(s.data);
        setProducts(p.data);
        setOrders(o.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group products by category for mini chart
  const categoryMap = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => b.order_id - a.order_id)
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", fontSize:28 }}>
      🌿
    </div>
  );

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {username} 👋</h1>
          <p className="page-subtitle">Here's what's happening at your store today.</p>
        </div>
        <span
          className="gs-badge"
          style={{ background: role === "admin" ? "#ddeee2" : "#e3eaf5",
                   color: role === "admin" ? "#4a7c59" : "#6b8cba",
                   padding: "5px 14px", fontSize: 13, borderRadius: 99 }}
        >
          {role === "admin" ? "🛡️ Admin" : "🛍️ Customer"}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard icon="🛍️" label="Total Products" value={productCount} color="green"  />
        <StatCard icon="🧾" label="Total Orders"   value={orderCount}   color="blue"   />
        <StatCard icon="💰" label="Total Revenue"  value={revenue}      color="amber" prefix="₹" />
      </div>

      {/* Two-column grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:24 }}>

        {/* Recent Orders */}
        <div className="gs-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <h3 style={{ fontSize:15, fontWeight:600 }}>Recent Orders</h3>
            <a href="/order-history" style={{ fontSize:13, color:"var(--accent-green)", textDecoration:"none", fontWeight:500 }}>
              View all →
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="gs-empty">
              <div className="gs-empty-icon">🧾</div>
              <div className="gs-empty-title">No orders yet</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {recentOrders.map((o) => (
                <div key={o.order_id} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"11px 14px", background:"var(--bg-secondary)",
                  borderRadius:"var(--radius-md)", gap:12,
                }}>
                  <div>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--text-primary)" }}>
                      {o.customer_name}
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>
                      #{o.order_id} · {new Date(o.datetime).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <div style={{ fontWeight:700, color:"var(--accent-green)", fontSize:14.5 }}>
                    ₹{o.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="gs-card">
          <div style={{ marginBottom:18 }}>
            <h3 style={{ fontSize:15, fontWeight:600 }}>Products by Category</h3>
          </div>
          {Object.keys(categoryMap).length === 0 ? (
            <div className="gs-empty">
              <div className="gs-empty-icon">📦</div>
              <div className="gs-empty-title">No products yet</div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {Object.entries(categoryMap).map(([cat, count]) => {
                const pct = Math.round((count / products.length) * 100);
                const clr = CATEGORY_COLORS[cat] || { bg:"#e8f0ea", color:"#4a7c59" };
                return (
                  <div key={cat}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:13 }}>
                      <span style={{ fontWeight:500, color:"var(--text-primary)" }}>{cat}</span>
                      <span style={{ color:"var(--text-muted)" }}>{count} item{count!==1?"s":""}</span>
                    </div>
                    <div style={{ height:8, background:"var(--bg-secondary)", borderRadius:99, overflow:"hidden" }}>
                      <div style={{
                        height:"100%", width:`${pct}%`,
                        background: clr.color,
                        borderRadius:99,
                        transition:"width 1s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Quick View */}
      <div className="gs-card">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <h3 style={{ fontSize:15, fontWeight:600 }}>Product Catalog Preview</h3>
          <a href="/products" style={{ fontSize:13, color:"var(--accent-green)", textDecoration:"none", fontWeight:500 }}>
            Manage products →
          </a>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>
          {products.slice(0, 6).map((p) => {
            const clr = CATEGORY_COLORS[p.category] || { bg:"#e8f0ea", color:"#4a7c59" };
            return (
              <div key={p.product_id} style={{
                background:"var(--bg-secondary)",
                borderRadius:"var(--radius-md)",
                padding:"14px 16px",
                border:"1px solid var(--border-soft)",
                transition:"var(--transition)",
              }}>
                <div style={{
                  display:"inline-flex", alignItems:"center",
                  background: clr.bg, color: clr.color,
                  borderRadius: 99, padding:"3px 10px", fontSize:11.5, fontWeight:500, marginBottom:8,
                }}>
                  {p.category}
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", marginBottom:4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize:13.5, fontWeight:700, color:"var(--accent-green)" }}>
                  ₹{p.price_per_unit}
                  <span style={{ fontSize:11, fontWeight:400, color:"var(--text-muted)", marginLeft:4 }}>/{p.uom_name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;