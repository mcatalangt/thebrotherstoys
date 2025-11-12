import type { Product } from '../types';

type Props = {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
};

export default function ProductList({ products, onEdit, onDelete }: Props) {
  return (
    <div className="mt-6">
      <table className="min-w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Imagen</th>
            <th className="text-left p-3">Nombre</th>
            <th className="text-left p-3">Precio</th>
            <th className="text-left p-3">Descripción</th>
            <th className="text-left p-3">Tags</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">
                {p.imageUrl && p.imageUrl.length > 0 ? (
                  <img
                    src={p.imageUrl[0]}
                    alt={p.name}
                    className="w-16 h-10 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-400">
                    No
                  </div>
                )}
              </td>
              <td className="p-3">{p.name}</td>
              <td className="p-3">${p.price.toFixed(2)}</td>
              <td className="p-3">{p.description ?? '-'}</td>
              <td className="p-3">
                <div className="flex gap-2 flex-wrap">
                  {(p.tags ?? []).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </td>
              <td className="p-3 text-center">
                <button
                  className="text-sm mr-2 px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => onEdit(p)}
                >
                  Edit
                </button>
                <button
                  className="text-sm px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => onDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No hay productos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}