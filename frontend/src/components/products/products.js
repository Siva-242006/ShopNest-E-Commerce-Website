import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './products.css';
import Navbar from '../navbar/navbar';
import { useUserDetails } from '../../context/UserContext';

const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { role } = useUserDetails();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const category = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [sortOrder, setSortOrder] = useState('');


  useEffect(() => {
    document.title = 'E-Commerce Website';
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('jwt_token');
    if (!jwt) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const res = await fetch(`${apiUrl}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortOrder]);


  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this product?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`${apiUrl}/products/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="products-container">
        <div className='products-add-product-container'>
        <h1 className='products-heading'>Products</h1>
        {role === 'Admin' && (
          <div className="admin-header">
            <button className="add-button" onClick={() => navigate('/admin/products/add')}>
              + Add New Product
            </button>
          </div>
        )}
        </div>

        <div className="filters-container">
          <input
            type="text"
            className="products-search-input"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {[...new Set(products.map(p => p.category))].map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>


        {loading ? (
          <p className="loading">Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(
              (product) =>
                product.stock > 0 && (
                  <div key={product._id} className="product-card">
                    <Link to={`/products/${product._id}`} className="product-link">
                      <img src={product.image} alt={product.name} />
                      <h2>{product.name}</h2>
                      <p>Category: {product.category}</p>
                      <p>Price: ₹{product.price}</p>
                      <p>{product.description}</p>
                    </Link>

                    {role === 'Admin' && (
                      <div className="admin-actions">
                        <button
                          className="edit-btn"
                          onClick={() => navigate(`/admin/products/update/${product._id}`)}
                        >
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
