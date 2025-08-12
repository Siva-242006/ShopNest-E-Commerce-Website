import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserDetails } from "../../context/UserContext";
import "./addOrUpdateProduct.css";

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AddOrUpdateProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useUserDetails();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    brand: "",
    category: "",
    stock: "",
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`${apiUrl}/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load product");
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    fetch(`${apiUrl}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    if (value === "add-new") {
      setIsAddingNewCategory(true);
    } else {
      setIsAddingNewCategory(false);
      setProduct((prev) => ({ ...prev, category: value }));
    }
  };

  const handleNewCategorySubmit = async () => {
    if (!newCategory.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await res.json();
      setCategories((prev) => [...prev, data]);
      setProduct((prev) => ({ ...prev, category: data.name }));
      setNewCategory("");
      setIsAddingNewCategory(false);
    } catch (err) {
      alert("Error adding category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const method = id ? "PUT" : "POST";
    const url = id
      ? `${apiUrl}/products/update/${id}`
      : `${apiUrl}/products/add`;

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");

      alert(data.message || "Product saved successfully");
      navigate("/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (role !== "Admin") return null;

  return (
    <div className="form-container">
      <h2 className="form-title">{id ? "Update" : "Add"} Product</h2>
      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} className="product-form">
          <label>
            Name:
            <input name="name" value={product.name} onChange={handleChange} required />
          </label>

          <label>
            Description:
            <textarea name="description" value={product.description} onChange={handleChange} required />
          </label>

          <label>
            Price:
            <input type="number" name="price" value={product.price} onChange={handleChange} required />
          </label>

          <label>
            Image URL:
            <input name="image" value={product.image} onChange={handleChange} required />
          </label>

          <label>
            Brand:
            <input name="brand" value={product.brand} onChange={handleChange} required />
          </label>

          <label>
            Category:
            <select value={product.category} onChange={handleCategoryChange} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
              <option value="add-new">Add New Category</option>
            </select>
          </label>

          {isAddingNewCategory && (
            <div className="add-new-category">
              <input
                type="text"
                placeholder="Enter new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" onClick={handleNewCategorySubmit}>
                Add
              </button>
            </div>
          )}

          <label>
            Stock:
            <input type="number" name="stock" value={product.stock} onChange={handleChange} required />
          </label>

          <button type="submit" className="submit-btn" disabled={loading}>
            {id ? "Update" : "Add"} Product
          </button>
        </form>
      )}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default AddOrUpdateProductForm;
