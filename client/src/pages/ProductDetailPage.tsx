import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiProductsById, postApiCart, type Product } from "../api/api";
import { ErrorState, Spinner } from "../components/Feedback";
import { formatPrice, getApiErrorMessage } from "../utils/format";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const result = await getApiProductsById({ path: { id } });
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Product not found"));
      setProduct(null);
    } else if (!result.data) {
      setError("The product response was empty");
      setProduct(null);
    } else {
      setProduct(result.data.data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/products/${product._id}` } });
      return;
    }
    setAdding(true);
    setAdded(false);
    setAddError(null);
    const result = await postApiCart({ body: { productId: product._id, quantity } });
    setAdding(false);
    if (result.error) {
      setAddError(getApiErrorMessage(result.error, "Failed to add item to cart"));
    } else {
      setAdded(true);
    }
  };

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => (product ? Math.min(product.stock, q + 1) : q));

  if (loading) return <Spinner label="Loading product..." />;
  if (error || !product) return <ErrorState message={error ?? "Product not found"} onRetry={() => void loadProduct()} />;

  return (
    <article className="product-detail">
      <div className="product-detail-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">NO IMAGE</div>
        )}
      </div>
      <div className="product-detail-info">
        <p className="product-card-category">{product.category}</p>
        <h1 className="product-detail-name">{product.name}</h1>
        <p className="product-detail-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? "product-card-stock" : "product-card-stock out"}>
          {product.stock > 0 ? `In stock · ${product.stock} available` : "Out of stock"}
        </p>
        <p className="product-detail-description">
          {product.description || "No description provided."}
        </p>

        <div className="product-detail-actions">
          {product.stock > 0 ? (
            <>
              <div className="quantity-picker">
                <button type="button" className="btn btn-outline" onClick={decrement} aria-label="Decrease quantity">
                  −
                </button>
                <span className="quantity-value">{quantity}</span>
                <button type="button" className="btn btn-outline" onClick={increment} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button type="button" className="btn" onClick={() => void handleAddToCart()} disabled={adding}>
                {adding ? "Adding..." : isAuthenticated ? "Add to cart" : "Login to add to cart"}
              </button>
            </>
          ) : (
            <p className="product-card-stock out">Out of stock</p>
          )}
        </div>

        {added && <p className="form-success">Added to cart. <Link to="/cart">View cart →</Link></p>}
        {addError && <p className="form-error">{addError}</p>}
      </div>
    </article>
  );
}