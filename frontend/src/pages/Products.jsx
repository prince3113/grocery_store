import { useEffect, useState } from "react";
import API from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [uomId, setUomId] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const isAdmin =
  sessionStorage.getItem("role") === "admin";

  const loadProducts = () => {
    API.get("/getProducts")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const loadUOMs = () => {
    API.get("/getUOM")
      .then((response) => {
        setUoms(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    loadProducts();
    loadUOMs();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    if (!uomId) {
      alert("Please select a unit");
      return;
    }

    try {
      await API.post("/insertProduct", {
        product_name: productName,
        uom_id: Number(uomId),
        price_per_unit: Number(price),
        category: category,
      });

      setProductName("");
      setPrice("");
      setUomId("");
      setCategory("");
      loadProducts();

      alert("Product Added Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
  
    if (!confirmDelete) return;
  
    try {
      await API.post("/deleteProduct", {
        product_id: id,
      });
  
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const updateProduct = async () => {
    try {
      await API.post("/updateProduct", {
        product_id: editingProduct.product_id,
        product_name: editingProduct.name,
        uom_id: editingProduct.uom_id,
        price_per_unit: Number(
          editingProduct.price_per_unit
        ),
        category: editingProduct.category,
      });

      loadProducts();
      setEditingProduct(null);

      alert("Product Updated Successfully");
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };
  return (
    <div>
      <h2 className="mb-4">Products</h2>

      {isAdmin && (
      <div className="card mb-4">
        <div className="card-header">
          <h5>Add Product</h5>
        </div>

        <div className="card-body">
          <form onSubmit={addProduct}>
            <div className="mb-3">
              <label className="form-label">
                Product Name
              </label>

              <input
                type="text"
                className="form-control"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Price Per Unit
              </label>

              <input
              type="number"
              className="form-control"
              value={price}
              min="1"
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            </div>
            <div className="mb-3">
  <label className="form-label">
    Category
  </label>

  <select
    className="form-select"
    value={category}
    onChange={(e) => {
      setCategory(e.target.value);
      setUomId("");
    }}
    required
  >
    <option value="">
      Select Category
    </option>

    <option value="Grocery">
      Grocery
    </option>

    <option value="Fruits">
      Fruits
    </option>

    <option value="Dairy">
      Dairy
    </option>

    <option value="Electronics">
      Electronics
    </option>
  </select>
</div>

            <div className="mb-3">
              <label className="form-label">
                Unit
              </label>

              <select
                className="form-select"
                value={uomId}
                onChange={(e) =>
                  setUomId(e.target.value)
                }
                required
              >
                <option value="">
                  Select Unit
                </option>

                {uoms.map((uom) => (
                  <option
                    key={uom.uom_id}
                    value={uom.uom_id}
                  >
                    {uom.uom_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-success"
            >
              Add Product
            </button>
          </form>
          </div>
        </div>
      )}

      {isAdmin && editingProduct && (
  <div className="card mb-4">
    <div className="card-header bg-warning">
      <h5>Edit Product</h5>
    </div>

    <div className="card-body">

      <div className="mb-3">
        <label className="form-label">
          Product Name
        </label>

        <input
          type="text"
          className="form-control"
          value={editingProduct.name}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              name: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Price
        </label>

        <input
          type="number"
          className="form-control"
          value={editingProduct.price_per_unit}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              price_per_unit: e.target.value,
            })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Category
        </label>

        <select
          className="form-select"
          value={editingProduct.category}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              category: e.target.value,
            })
          }
        >
          <option value="Grocery">Grocery</option>
          <option value="Fruits">Fruits</option>
          <option value="Dairy">Dairy</option>
          <option value="Electronics">Electronics</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">
          Unit
        </label>

        <select
          className="form-select"
          value={editingProduct.uom_id}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              uom_id: Number(e.target.value),
            })
          }
        >
          {uoms.map((uom) => (
            <option
              key={uom.uom_id}
              value={uom.uom_id}
            >
              {uom.uom_name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-success me-2"
        onClick={updateProduct}
      >
        Save Changes
      </button>

      <button
        className="btn btn-secondary"
        onClick={() =>
          setEditingProduct(null)
        }
      >
        Cancel
      </button>

    </div>
  </div>
)}

<div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="🔍 Search Product..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>
<table className="table table-bordered table-hover">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Unit</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
        {products
  .filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .map((product) => (
            <tr key={product.product_id}>
              <td>{product.product_id}</td>
              <td>{product.name}</td>
              <td>₹{product.price_per_unit}</td>
              <td>{product.category}</td>
              <td>{product.uom_name}</td>

              <td>
  {isAdmin && (
    <>
      <button
        className="btn btn-warning btn-sm me-2"
        onClick={() => setEditingProduct(product)}
      >
        Edit
      </button>

      <button
        className="btn btn-danger btn-sm"
        onClick={() =>
          deleteProduct(product.product_id)
        }
      >
        Delete
      </button>
    </>
  )}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;