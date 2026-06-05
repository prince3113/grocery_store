import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

const CATEGORIES = ["Grocery", "Fruits", "Dairy", "Grains", "Electronics"];

const CATEGORY_COLORS = {
  Fruits:      { bg: "#ddeee2", color: "#4a7c59" },
  Dairy:       { bg: "#e3eaf5", color: "#6b8cba" },
  Grains:      { bg: "#faeee3", color: "#c9884c" },
  Electronics: { bg: "#fdf3dc", color: "#c9a84c" },
  Grocery:     { bg: "#e8f0ea", color: "#6aab7a" },
};

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`gs-toast ${type}`} role="alert">
      <span>{type === "success" ? "✅" : "❌"}</span>
      {msg}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="gs-modal-overlay">
      <div className="gs-modal" style={{ maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🗑️</div>
          <h3 className="gs-modal-title">Delete Product</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 8 }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn-secondary-gs" onClick={onCancel}>Cancel</button>
          <button className="btn-danger-gs" style={{ padding:"9px 22px", borderRadius:"var(--radius-md)", fontSize:14 }} onClick={onConfirm}>
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ─────────────────────────────────────────────────────────────────
function EditModal({ product, uoms, onSave, onClose, saving }) {
  const [data, setData] = useState({ ...product });
  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));

  return (
    <div className="gs-modal-overlay">
      <div className="gs-modal">
        <div className="gs-modal-header">
          <h3 className="gs-modal-title">✏️ Edit Product</h3>
          <button className="btn-icon-gs" onClick={onClose}>✕</button>
        </div>

        <div className="gs-form-group">
          <label className="gs-label">Product Name</label>
          <input
            className="gs-input"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Product name"
          />
        </div>

        <div className="form-grid-2">
          <div className="gs-form-group">
            <label className="gs-label">Price per Unit (₹)</label>
            <input
              type="number"
              className="gs-input"
              value={data.price_per_unit}
              min="1"
              onChange={(e) => set("price_per_unit", e.target.value)}
            />
          </div>
          <div className="gs-form-group">
            <label className="gs-label">Unit</label>
            <div className="gs-select-wrapper">
              <select
                className="gs-select"
                value={data.uom_id}
                onChange={(e) => set("uom_id", Number(e.target.value))}
              >
                {uoms.map((u) => (
                  <option key={u.uom_id} value={u.uom_id}>{u.uom_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="gs-form-group">
          <label className="gs-label">Category</label>
          <div className="gs-select-wrapper">
            <select
              className="gs-select"
              value={data.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button className="btn-secondary-gs" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button
            className="btn-primary-gs"
            onClick={() => onSave(data)}
            disabled={saving}
            style={{ flex: 1, justifyContent: "center", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Products Component ────────────────────────────────────────────────────
function Products() {
  const [products,       setProducts]       = useState([]);
  const [uoms,           setUoms]           = useState([]);
  const [search,         setSearch]         = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const [showAddForm,    setShowAddForm]    = useState(false);
  const [toast,          setToast]          = useState(null);
  const [saving,         setSaving]         = useState(false);

  // Add form state
  const [productName, setProductName] = useState("");
  const [price,       setPrice]       = useState("");
  const [uomId,       setUomId]       = useState("");
  const [category,    setCategory]    = useState("");

  const isAdmin = sessionStorage.getItem("role") === "admin";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
  };

  const loadProducts = useCallback(() => {
    API.get("/getProducts").then((r) => setProducts(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    loadProducts();
    API.get("/getUOM").then((r) => setUoms(r.data)).catch(console.error);
  }, [loadProducts]);

  const addProduct = async (e) => {
    e.preventDefault();
    if (!uomId) { showToast("Please select a unit", "error"); return; }
    setSaving(true);
    try {
      await API.post("/insertProduct", {
        product_name: productName,
        uom_id: Number(uomId),
        price_per_unit: Number(price),
        category,
      });
      setProductName(""); setPrice(""); setUomId(""); setCategory("");
      setShowAddForm(false);
      loadProducts();
      showToast("Product added successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.post("/deleteProduct", { product_id: confirmDelete });
      loadProducts();
      showToast("Product deleted.");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await API.post("/updateProduct", {
        product_id: data.product_id,
        product_name: data.name,
        uom_id: data.uom_id,
        price_per_unit: Number(data.price_per_unit),
        category: data.category,
      });
      loadProducts();
      setEditingProduct(null);
      showToast("Product updated successfully!");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <div className="fade-in">
      {/* Modals */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          uoms={uoms}
          onSave={handleUpdate}
          onClose={() => setEditingProduct(null)}
          saving={saving}
        />
      )}
      {confirmDelete !== null && (
        <ConfirmModal
          message="This will permanently delete the product."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in your catalog</p>
        </div>
        {isAdmin && (
          <button
            className="btn-primary-gs"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "✕ Cancel" : "＋ Add Product"}
          </button>
        )}
      </div>

      {/* Add Product Form */}
      {isAdmin && showAddForm && (
        <div className="gs-card mb-24 fade-in">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Add New Product</h3>
          <form onSubmit={addProduct}>
            <div className="form-grid-2">
              <div className="gs-form-group">
                <label className="gs-label">Product Name</label>
                <input
                  className="gs-input"
                  placeholder="e.g. Basmati Rice"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="gs-form-group">
                <label className="gs-label">Price per Unit (₹)</label>
                <input
                  type="number"
                  className="gs-input"
                  placeholder="e.g. 80"
                  value={price}
                  min="1"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="gs-form-group">
                <label className="gs-label">Category</label>
                <div className="gs-select-wrapper">
                  <select
                    className="gs-select"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setUomId(""); }}
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="gs-form-group">
                <label className="gs-label">Unit of Measure</label>
                <div className="gs-select-wrapper">
                  <select
                    className="gs-select"
                    value={uomId}
                    onChange={(e) => setUomId(e.target.value)}
                    required
                  >
                    <option value="">Select Unit</option>
                    {uoms.map((u) => (
                      <option key={u.uom_id} value={u.uom_id}>{u.uom_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary-gs"
              disabled={saving}
              style={{ opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Adding…" : "＋ Add Product"}
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div className="gs-search-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="search-icon">🔍</span>
          <input
            className="gs-input"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter chips */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          {categories.map((c) => {
            const active = filterCategory === c;
            const clr = CATEGORY_COLORS[c] || { bg: "var(--accent-green-soft)", color: "var(--accent-green)" };
            return (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 99,
                  border: active ? "none" : "1.5px solid var(--border-soft)",
                  background: active ? (c === "All" ? "var(--accent-green)" : clr.color) : "var(--bg-card)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "var(--font-main)",
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="gs-table-wrapper">
        <table className="gs-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
              {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5}>
                  <div className="gs-empty">
                    <div className="gs-empty-icon">🔍</div>
                    <div className="gs-empty-title">No products found</div>
                    <div className="gs-empty-desc">Try adjusting your search or filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const clr = CATEGORY_COLORS[p.category] || { bg:"#e8f0ea", color:"#4a7c59" };
                return (
                  <tr key={p.product_id}>
                    <td style={{ color:"var(--text-muted)", fontSize:12.5, width:48 }}>#{p.product_id}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span style={{
                        display:"inline-flex", alignItems:"center",
                        background:clr.bg, color:clr.color,
                        borderRadius:99, padding:"3px 11px",
                        fontSize:12.5, fontWeight:500,
                      }}>{p.category}</span>
                    </td>
                    <td style={{ fontWeight:600, color:"var(--accent-green)" }}>₹{p.price_per_unit}</td>
                    <td style={{ color:"var(--text-secondary)", fontSize:13 }}>{p.uom_name}</td>
                    {isAdmin && (
                      <td style={{ textAlign:"right" }}>
                        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                          <button className="btn-edit-gs" onClick={() => setEditingProduct(p)}>
                            ✏️ Edit
                          </button>
                          <button className="btn-danger-gs" onClick={() => setConfirmDelete(p.product_id)}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-muted-gs text-sm" style={{ marginTop: 12 }}>
          Showing {filtered.length} of {products.length} products
        </p>
      )}
    </div>
  );
}

export default Products;