import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API from "../services/api";

const CATEGORY_META = {
  Fruits: { emoji: "🍎", bg: "#ddeee2", color: "#4a7c59" },
  Dairy: { emoji: "🥛", bg: "#e3eaf5", color: "#6b8cba" },
  Grains: { emoji: "🌾", bg: "#faeee3", color: "#c9884c" },
  Electronics: { emoji: "💻", bg: "#fdf3dc", color: "#c9a84c" },
  Grocery: { emoji: "🛒", bg: "#e8f0ea", color: "#6aab7a" },
};

const DEFAULT_META = { emoji: "📦", bg: "#f0ece8", color: "#9e8c7a" };

const getProductEmoji = (name, category) => {
  const n = name.toLowerCase();

  // Fruits
  if (n.includes("apple")) return "🍎";
  if (n.includes("banana")) return "🍌";
  if (n.includes("cherry")) return "🍒";
  if (n.includes("grape")) return "🍇";
  if (n.includes("orange")) return "🍊";
  if (n.includes("lemon")) return "🍋";
  if (n.includes("strawberry")) return "🍓";
  if (n.includes("watermelon") || n.includes("melon")) return "🍉";
  if (n.includes("peach")) return "🍑";
  if (n.includes("pineapple")) return "🍍";
  if (n.includes("mango")) return "🥭";
  if (n.includes("kiwi")) return "🥝";
  if (n.includes("berry") || n.includes("berries")) return "🫐";
  if (n.includes("pear")) return "🍐";
  if (n.includes("coconut")) return "🥥";

  // Grains / Bread / Baking
  if (n.includes("wheat") || n.includes("atta") || n.includes("flour")) return "🌾";
  if (n.includes("rice")) return "🍚";
  if (n.includes("bread")) return "🍞";
  if (n.includes("oat")) return "🥣";
  if (n.includes("pasta") || n.includes("noodle")) return "🍝";

  // Dairy
  if (n.includes("milk")) return "🥛";
  if (n.includes("cheese")) return "🧀";
  if (n.includes("butter")) return "🧈";
  if (n.includes("yogurt") || n.includes("curd")) return "🥛";
  if (n.includes("egg")) return "🥚";

  // Vegetables
  if (n.includes("potato")) return "🥔";
  if (n.includes("tomato")) return "🍅";
  if (n.includes("onion")) return "🧅";
  if (n.includes("garlic")) return "🧄";
  if (n.includes("carrot")) return "🥕";
  if (n.includes("corn")) return "🌽";
  if (n.includes("broccoli") || n.includes("cabbage")) return "🥦";
  if (n.includes("cucumber")) return "🥒";
  if (n.includes("chili") || n.includes("pepper")) return "🌶️";
  if (n.includes("spinach") || n.includes("lettuce") || n.includes("okra") || n.includes("lady finger")) return "🥬";

  // Electronics
  if (n.includes("ssd") || n.includes("hard drive") || n.includes("disk")) return "💾";
  if (n.includes("laptop") || n.includes("computer")) return "💻";
  if (n.includes("phone") || n.includes("mobile")) return "📱";
  if (n.includes("watch")) return "⌚";
  if (n.includes("keyboard")) return "⌨️";
  if (n.includes("mouse")) return "🖱️";
  if (n.includes("headphone") || n.includes("earphone")) return "🎧";
  if (n.includes("cable") || n.includes("charger")) return "🔌";

  // Fallback to category defaults
  if (category === "Fruits") return "🍎";
  if (category === "Dairy") return "🥛";
  if (category === "Grains") return "🌾";
  if (category === "Electronics") return "💻";
  if (category === "Grocery") return "🛒";

  return "📦";
};

function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return createPortal(
    <div className={`gs-toast ${type}`}>
      <span>{type === "success" ? "✅" : "❌"}</span> {msg}
    </div>,
    document.body
  );
}

export default function CustomerShop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);   // { product, qty }
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);

  const username = sessionStorage.getItem("username") || "Customer";
  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    API.get("/getProducts")
      .then((r) => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* Cart helpers */
  const cartTotal = cart.reduce((s, i) => s + i.product.price_per_unit * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.product_id === product.product_id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`${product.name} added to cart`);
  };

  const updateQty = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((i) =>
          i.product.product_id === productId
            ? { ...i, qty: i.qty + delta }
            : i
        )
        .filter((i) => i.qty > 0);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.product.product_id !== productId));
  };

  const placeOrder = async () => {
    if (cart.length === 0) { showToast("Your cart is empty", "error"); return; }
    setPlacing(true);
    try {
      const res = await API.post("/insertOrder", {
        customer_name: username,
        total: cartTotal,
        order_details: cart.map((i) => ({
          product_id: i.product.product_id,
          quantity: i.qty,
          total_price: i.product.price_per_unit * i.qty,
        })),
      });
      showToast(`🎉 Order #${res.data.order_id} placed successfully!`);
      setCart([]);
      setShowCart(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Order failed", "error");
    } finally {
      setPlacing(false);
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === "All" || p.category === filter;
    return matchSearch && matchCat;
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="fade-in">
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* ── Cart Drawer ─────────────────────────────── */}
      {showCart && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(44,62,48,0.28)",
            backdropFilter: "blur(3px)",
            zIndex: 400,
          }}
          onClick={() => setShowCart(false)}
        />
      )}
      <div style={{
        position: "fixed", top: 20, right: 20,
        width: 360, maxHeight: "calc(100vh - 40px)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        zIndex: 500,
        transform: showCart ? "translateX(0)" : "translateX(calc(100% + 40px))",
        visibility: showCart ? "visible" : "hidden",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1), visibility 0.28s",
        display: "flex", flexDirection: "column",
      }}>
        {/* Cart header */}
        <div style={{
          padding: "20px 22px", borderBottom: "1px solid var(--border-soft)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Your Cart
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
              {cartCount} item{cartCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn-icon-gs" onClick={() => setShowCart(false)}>✕</button>
        </div>

        {/* Cart items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
          {cart.length === 0 ? (
            <div className="gs-empty" style={{ paddingTop: 60 }}>
              <div className="gs-empty-icon">🛒</div>
              <div className="gs-empty-title">Cart is empty</div>
              <div className="gs-empty-desc">Add products to get started</div>
            </div>
          ) : (
            cart.map((item) => {
              const meta = CATEGORY_META[item.product.category] || DEFAULT_META;
              return (
                <div key={item.product.product_id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border-soft)",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: meta.bg, color: meta.color,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 20,
                    flexShrink: 0,
                  }}>
                    {getProductEmoji(item.product.name, item.product.category)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-primary)" }}>
                      {item.product.name}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                      ₹{item.product.price_per_unit}/{item.product.uom_name}
                    </div>
                  </div>
                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                      onClick={() => updateQty(item.product.product_id, -1)}
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        border: "1.5px solid var(--border-medium)",
                        background: "var(--bg-secondary)", cursor: "pointer",
                        fontSize: 16, lineHeight: 1, color: "var(--text-secondary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 18, textAlign: "center" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.product.product_id, 1)}
                      style={{
                        width: 26, height: 26, borderRadius: 7,
                        border: "1.5px solid var(--accent-green)",
                        background: "var(--accent-green-soft)", cursor: "pointer",
                        fontSize: 16, lineHeight: 1, color: "var(--accent-green)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >+</button>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--accent-green)", fontSize: 13.5, minWidth: 56, textAlign: "right" }}>
                    ₹{item.product.price_per_unit * item.qty}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.product_id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-rose)", fontSize: 15, padding: 2 }}
                  >✕</button>
                </div>
              );
            })
          )}
        </div>

        {/* Cart footer */}
        {cart.length > 0 && (
          <div style={{ padding: "18px 22px", borderTop: "1px solid var(--border-soft)" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginBottom: 14, alignItems: "baseline",
            }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>Total</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "var(--accent-green)", fontFamily: "var(--font-display)" }}>
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
            <button
              className="btn-primary-gs w-full"
              style={{ justifyContent: "center", padding: "13px", fontSize: 15, opacity: placing ? 0.7 : 1 }}
              onClick={placeOrder}
              disabled={placing}
            >
              {placing ? "Placing order…" : "✓ Place Order"}
            </button>
          </div>
        )}
      </div>

      {/* ── Page Header ────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {username}! 🌿</h1>
          <p className="page-subtitle">Browse our fresh selection and fill your cart</p>
        </div>
        {/* Cart button */}
        <button
          onClick={() => setShowCart(true)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--bg-card)", border: "1.5px solid var(--border-soft)",
            borderRadius: "var(--radius-md)", padding: "10px 18px",
            cursor: "pointer", transition: "var(--transition)",
            boxShadow: "var(--shadow-xs)", position: "relative",
          }}
        >
          <span style={{ fontSize: 20 }}>🛒</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>My Cart</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              {cartCount === 0 ? "Empty" : `${cartCount} item${cartCount !== 1 ? "s" : ""} · ₹${cartTotal.toFixed(0)}`}
            </div>
          </div>
          {cartCount > 0 && (
            <div style={{
              position: "absolute", top: -7, right: -7,
              width: 20, height: 20, borderRadius: "50%",
              background: "var(--accent-green)", color: "#fff",
              fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {cartCount}
            </div>
          )}
        </button>
      </div>

      {/* ── Category + Search Bar ───────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div className="gs-search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input
            className="gs-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {categories.map((c) => {
            const meta = CATEGORY_META[c] || DEFAULT_META;
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                style={{
                  padding: "7px 16px", borderRadius: 99,
                  border: active ? "none" : "1.5px solid var(--border-soft)",
                  background: active ? (c === "All" ? "#4a7c59" : meta.color) : "var(--bg-card)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  transition: "all 0.18s", fontFamily: "var(--font-main)",
                }}
              >
                {c !== "All" && <span style={{ marginRight: 5 }}>{meta.emoji}</span>}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Grid ────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, fontSize: 30 }}>🌿</div>
      ) : filtered.length === 0 ? (
        <div className="gs-card">
          <div className="gs-empty">
            <div className="gs-empty-icon">🔍</div>
            <div className="gs-empty-title">No products found</div>
            <div className="gs-empty-desc">Try a different search or category</div>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}>
          {filtered.map((p) => {
            const meta = CATEGORY_META[p.category] || DEFAULT_META;
            const cartItem = cart.find((i) => i.product.product_id === p.product_id);

            return (
              <div key={p.product_id} style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-soft)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xs)",
                overflow: "hidden",
                transition: "var(--transition)",
                display: "flex", flexDirection: "column",
              }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-md)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow-xs)"}
              >
                {/* Product image area */}
                <div style={{
                  height: 110, background: meta.bg,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 48,
                }}>
                  {getProductEmoji(p.name, p.category)}
                </div>

                <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Category badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center",
                    background: meta.bg, color: meta.color,
                    borderRadius: 99, padding: "2px 10px",
                    fontSize: 11.5, fontWeight: 500, marginBottom: 8, alignSelf: "flex-start",
                  }}>
                    {p.category}
                  </div>

                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 4 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                    per {p.uom_name}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--accent-green)" }}>
                      ₹{p.price_per_unit}
                    </div>

                    {/* Add / Qty control */}
                    {cartItem ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => updateQty(p.product_id, -1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: "1.5px solid var(--border-medium)",
                            background: "var(--bg-secondary)", cursor: "pointer",
                            fontSize: 17, fontWeight: 700, color: "var(--text-secondary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >−</button>
                        <span style={{ fontWeight: 700, fontSize: 15, minWidth: 16, textAlign: "center" }}>
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => updateQty(p.product_id, 1)}
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: "1.5px solid var(--accent-green)",
                            background: "var(--accent-green-soft)", cursor: "pointer",
                            fontSize: 17, fontWeight: 700, color: "var(--accent-green)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >+</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          background: "var(--accent-green-soft)",
                          color: "var(--accent-green)",
                          border: "1.5px solid #b8d9c4",
                          borderRadius: 10, padding: "7px 12px",
                          fontSize: 13, fontWeight: 600,
                          cursor: "pointer", transition: "all 0.18s",
                          fontFamily: "var(--font-main)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--accent-green)";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.borderColor = "var(--accent-green)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "var(--accent-green-soft)";
                          e.currentTarget.style.color = "var(--accent-green)";
                          e.currentTarget.style.borderColor = "#b8d9c4";
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-muted-gs text-sm" style={{ marginTop: 16 }}>
          Showing {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
