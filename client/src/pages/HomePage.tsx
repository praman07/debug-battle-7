import { useEffect, useState } from "react";
import { getApiProducts, type Product } from "../api/api";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, ErrorState, Spinner } from "../components/Feedback";
import { getApiErrorMessage } from "../utils/format";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getApiProducts({
      query: {
        search: debouncedSearch || undefined,
        category: category || undefined,
      },
    }).then((result) => {
      if (cancelled) return;
      if (result.error) {
        setError(getApiErrorMessage(result.error, "Failed to load products"));
        setProducts([]);
      } else if (!result.data) {
        setError("The product response was empty");
        setProducts([]);
      } else {
        setProducts(result.data.data);
        if (!debouncedSearch && !category) {
          setCategories(
            Array.from(new Set(result.data.data.map((p) => p.category))).sort()
          );
        }
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category]);

  return (
    <div>
      <div className="catalog-toolbar">
        <input
          type="search"
          className="input"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search products"
        />
        <select
          className="input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading products..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : products.length === 0 ? (
        <EmptyState title="No products found">
          <p>
            {debouncedSearch || category
              ? "Try a different search term or category."
              : "No products available yet."}
          </p>
        </EmptyState>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}