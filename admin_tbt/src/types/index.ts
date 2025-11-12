// types.ts (Asumiendo que 'Product' tiene imageUrl: string[])
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string[]; // Array de URLs
}

// Interfaz para los datos que vienen del formulario (Cliente)
export interface FormPayload extends Omit<Product, 'id' | 'imageUrl'> {
    imageFiles?: File[]; // <-- Array de objetos File
    currentImageUrls?: string[]; // Para la edición, si no se cambian algunas URLs
}

// types.ts (o donde tengas la definición de tu API)

// Ajusta esta interfaz para reflejar la carga de múltiples archivos.
// Debe coincidir con lo que recibes del formulario y lo que envías al helper.
// types.ts o productService.ts

export interface CreateProductPayload extends Omit<Product, 'id' | 'imageUrl'> {
    // 1. Reemplazar la propiedad de archivo por el ARRAY
    imageFiles: File[]; 
    
    // 2. Si usas 'currentImageUrls' para la edición, inclúyela (opcional)
    currentImageUrls?: string[]; 
}

// Nota: Si 'Product' tiene imageUrl: string[], ya está bien.