import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiOrders, type Order } from "../api/api";
import { EmptyState, ErrorState, Spinner } from "../components/Feedback";
import { formatDate, formatPrice, getApiErrorMessage } from "../utils/format";

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getApiOrders();
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Failed to load orders"));
    } else if (!result.data) {
      setError("The orders response was empty");
      setOrders([]);
    } else {
      setOrders(result.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  if (loading) return <Spinner label="Loading orders..." />;
  if (error) return <ErrorState message={error} onRetry={() => void loadOrders()} />;

  if (orders.length === 0) {
    return (
      <EmptyState title="No orders yet">
        <p>Your order history will appear here once you place an order.</p>
        <Link to="/" className="btn">
          Browse products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <h1 className="page-title">Order history</h1>
      <ul className="order-list">
        {orders.map((order) => (
          <li key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <p className="order-id">{order._id}</p>
                <p className="order-date">{formatDate(order.createdAt)}</p>
              </div>
              <div className="order-card-right">
                <p className="order-status">{order.status}</p>
                <p className="order-total">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
            <ul className="order-items">
              {order.items.map((item) => (
                <li key={item.product._id} className="order-item">
                  <span className="order-item-name">{item.product.name}</span>
                  <span className="order-item-meta">
                    {formatPrice(item.price)} × {item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}