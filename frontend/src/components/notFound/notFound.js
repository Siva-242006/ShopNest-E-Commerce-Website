import { useNavigate } from "react-router-dom";
import Navbar from "../navbar/navbar";
import "./notFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <main className="not-found-page">
        <section className="not-found-card">
          <span>404</span>
          <h1>Page Not Found</h1>
          <p>The page you are looking for does not exist or may have been moved.</p>
          <div className="not-found-actions">
            <button type="button" onClick={() => navigate("/")}>Go Home</button>
            <button type="button" className="not-found-secondary" onClick={() => navigate("/products")}>
              Browse Products
            </button>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;
