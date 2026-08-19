import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  deleteApiProductsById,
  getApiProducts,
  postApiProducts,
  putApiProductsById,
  type Product,
} from "../api/api";
import { ErrorState, Spinner } from "../components/Feedback";
import { formatPrice, getApiErrorMessage } from "../utils/format";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  imageUrl: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
};

const toForm = (product: Product): ProductFormState => ({
  name: product.name,
  description: product.description,
  price: String(product.price),
  category: product.category,
  stock: String(product.stock),
  imageUrl: product.imageUrl,
});

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getApiProducts();
    if (result.error) {
      setError(getApiErrorMessage(result.error, "Failed to load products"));
      setProducts([]);
    } else if (!result.data) {
      setError("The product response was empty");
      setProducts([]);
    } else {
      setProducts(result.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const setField = (field: keyof ProductFormState, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const startEditing = (product: Product) => {
    setEditingId(product._id);
    setForm(toForm(product));
    setFormError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    const body = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      category: form.category.trim(),
      stock: form.stock === "" ? undefined : Number(form.stock),
      imageUrl: form.imageUrl.trim() || undefined,
    };

    const result = editingId
      ? await putApiProductsById({ path: { id: editingId }, body })
      : await postApiProducts({ body });

    setSaving(false);
    if (result.error) {
      setFormError(getApiErrorMessage(result.error, "Failed to save product"));
      return;
    }
    cancelEditing();
    await loadProducts();
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product._id);
    const result = await deleteApiProductsById({ path: { id: product._id } });
    setDeletingId(null);
    if (result.error) {
      setFormError(getApiErrorMessage(result.error, "Failed to delete product"));
      return;
    }
    if (editingId === product._id) cancelEditing();
    await loadProducts();
  };

  return (
    <div>
      <h1 className="page-title">Admin — Products</h1>

      <form className="admin-form" onSubmit={(e) => void handleSubmit(e)}>
        <h2>{editingId ? "Edit product" : "New product"}</h2>
        <div className="admin-form-grid">
          <label className="field">
            <span>Name *</span>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Category *</span>
            <input
              type="text"
              className="input"
              value={form.category}
              onChange={(event) => setField("category", event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Price (USD) *</span>
            <input
              type="number"
              className="input"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => setField("price", event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Stock</span>
            <input
              type="number"
              className="input"
              min={0}
              step={1}
              value={form.stock}
              onChange={(event) => setField("stock", event.target.value)}
            />
          </label>
          <label className="field admin-form-wide">
            <span>Description</span>
            <textarea
              className="input"
              rows={3}
              value={form.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </label>
          <label className="field admin-form-wide">
            <span>Image URL</span>
            <input
              type="url"
              className="input"
              value={form.imageUrl}
              onChange={(event) => setField("imageUrl", event.target.value)}
            />
          </label>
        </div>
        {formError && <p className="form-error">{formError}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Create product"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEditing}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="admin-list-title">Products ({products.length})</h2>
      {loading ? (
        <Spinner label="Loading products..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadProducts()} />
      ) : products.length === 0 ? (
        <p className="state-message">No products yet. Create the first one above.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.price)}</td>
                  <td>{product.stock}</td>
                  <td className="admin-table-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => startEditing(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm btn-danger"
                      onClick={() => void handleDelete(product)}
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}