import { useEffect, useState } from 'react';
import type { Product } from './types';
import * as api from './services/productService';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getAll();
      console.log('loaded products', list);
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('load error', err);
      setError(String(err ?? 'Error loading products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(payload: Omit<Product, 'id'>, id?: string) {
    try {
      if (id) {
        const updated = await api.updateProduct(id, payload);
        setProducts((s) => s.map((p) => (p.id === id ? (updated ?? p) : p)));
      } else {
        const created = await api.createProduct(payload);
        setProducts((s) => [created, ...s]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error('save error', err);
      setError(String(err ?? 'Error saving product'));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar producto?')) return;
    try {
      await api.deleteProduct(id);
      setProducts((s) => s.filter((p) => p.id !== id));
    } catch (err) {
      console.error('delete error', err);
      setError(String(err ?? 'Error deleting product'));
    }
  }

  function handleEdit(p: Product) {
    setEditing(p);
    setShowForm(true);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin - TheBrothersToys</h1>
        <div>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            Nuevo producto
          </button>
        </div>
      </header>

      <main>
        {loading && <p className="mt-6">Cargando...</p>}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            Error: {error}
            <button className="ml-4 underline" onClick={load}>Reintentar</button>
          </div>
        )}

        {!loading && !error && (
          <>
            <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />
            {showForm && (
              <div className="mt-6 p-4 bg-white rounded shadow">
                <h2 className="text-lg font-medium mb-4">{editing ? 'Editar producto' : 'Crear producto'}</h2>
                <ProductForm initial={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}