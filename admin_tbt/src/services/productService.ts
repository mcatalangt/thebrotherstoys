import { type Product, type CreateProductPayload } from  '../types';

const API_BASE = '/api/products'; 
const LS_KEY = 'admin_products_fallback';


async function safeFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) throw new Error('Network error');
    return (await res.json()) as T;
  } catch {
    const raw = localStorage.getItem(LS_KEY);
    return (raw ? JSON.parse(raw) : []) as unknown as T;
  }
}

export async function getAll(): Promise<Product[]> {
  return safeFetch<Product[]>(API_BASE);
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {

const { imageFiles, ...productData } = payload;
  const formData = new FormData();

  imageFiles.forEach((file: File) => {
        // El nombre del campo debe coincidir con upload.array('files') en el servidor.
        formData.append('files', file); 
    });

  Object.keys(productData).forEach(key => {
    formData.append(key, String(productData[key as keyof typeof productData])); 
  });

  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
      body: formData,
    });
    if (!res.ok) throw new Error('Network error');
    return (await res.json()) as Product;
} catch (error) {
    // --- Lógica de Fallback (LocalStorage) ---
    // NOTA: El fallback no puede guardar la imagen, solo el texto y una URL ficticia
    console.error("Fallo de red, usando fallback local:", error);
    
    const raw = localStorage.getItem(LS_KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    
    const p: Product = { 
        ...productData, 
        id: Date.now().toString(),
        // Usa una URL de placeholder ya que la imagen no se subió.
        imageUrl: ['placeholder.png']
    }; 
    
    list.push(p);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return p;
  }
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Network error');
    }
    return (await res.json()) as Product;
  } catch {
    const raw = localStorage.getItem(LS_KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const i = list.findIndex((p) => p.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...patch };
    localStorage.setItem(LS_KEY, JSON.stringify(list));
    return list[i];
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Network error');
    return true;
  } catch {
    const raw = localStorage.getItem(LS_KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    const next = list.filter((p) => p.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    return true;
  }
}