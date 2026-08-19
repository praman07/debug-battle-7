import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiCart, postApiOrders, type Cart, type Order } from "../api/api";
import { EmptyState, ErrorState, Spinner } from "../components/Feedback";
import { formatPrice, getApiErrorMessage } from "../utils/format";

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getApiCart();
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Failed to load cart"));
      setCart(null);
    } else if (!result.data) {
      setError("The cart response was empty");
      setCart(null);
    } else {
      setCart(result.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setPlaceError(null);
    const result = await postApiOrders();
    setPlacing(false);
    if (result.error) {
      setPlaceError(getApiErrorMessage(result.error, "Failed to place order"));
      return;
    }
    if (!result.data) {
      setPlaceError("The order response was empty");
      return;
    }
    setPlacedOrder(result.data.data);
    setCart({ items: [] });
  };

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) return <Spinner label="Loading cart..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadCart()} />;

  if (placedOrder) {
    return (
      <div className="state-box">
        <p className="state-title">Order placed</p>
        <p className="state-message">
          Order #{placedOrder._id} for {formatPrice(placedOrder.totalAmount)} has been placed
          successfully. Products are no longer available to purchase while in your cart.
        </p>
        <Link to="/orders" className="btn">
          View your orders
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState title="Your cart is empty">
        <p>Browse the catalog and add some products.</p>
        <Link to="/" className="btn">
          Browse products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="cart-layout">
      <div>
        <h1 className="page-title">Your cart</h1>
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.product._id} className="cart-item">
              <div className="cart-item-info">
                <Link to={`/products/${item.product._id}`} className="cart-item-name">
                  {item.product.name}
                </Link>
                <p className="cart-item-meta">
                  {formatPrice(item.product.price)} × {item.quantity}
                </p>
              </div>
              <p className="cart-item-total">{formatPrice(item.product.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="cart-summary">
        <h2>Summary</h2>
        <div className="cart-summary-row">
          <span>Items</span>
          <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <button type="button" className="btn" onClick={() => void handlePlaceOrder()} disabled={placing}>
          {placing ? "Placing order..." : "Place order"}
        </button>
        {placeError && <p className="form-error">{placeError}</p>}
      </aside>
    </div>
  );
}