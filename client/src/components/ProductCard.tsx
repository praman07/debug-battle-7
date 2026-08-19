import { Link } from "react-router-dom";
import type { Product } from "../api/api";
import { formatPrice } from "../utils/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="product-card-image" loading="lazy" />
      ) : (
        <div className="product-card-image product-card-placeholder">NO IMAGE</div>
      )}
      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">{formatPrice(product.price)}</p>
        <p className={product.stock > 0 ? "product-card-stock" : "product-card-stock out"}>
          {product.stock > 0 ? `In stock · ${product.stock}` : "Out of stock"}
        </p>
      </div>
    </Link>
  );
}