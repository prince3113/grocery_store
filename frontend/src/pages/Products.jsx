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

    try {
      await API.post("/insertProduct", {
        product_name: productName,
        uom_id: Number(uomId),
        price_per_unit: Number(price),
      });

      setProductName("");
      setPrice("");
      setUomId("");

      loadProducts();

      alert("Product Added Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await API.post("/deleteProduct", {
        product_id: id,
      });

      loadProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Products</h2>

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
            <th>Unit</th>
            <th>Actions</th>
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
              <td>{product.uom_name}</td>

              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    deleteProduct(product.product_id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;