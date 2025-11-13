// types.ts (Asumiendo que 'Product' tiene imageUrl: string[])
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string[]; // Array de URLs
    tags?: string[];
}



// types.ts (o donde tengas la definición de tu API)

// Ajusta esta interfaz para reflejar la carga de múltiples archivos.
// Debe coincidir con lo que recibes del formulario y lo que envías al helper.
// types.ts o productService.ts

export interface FileWithPreview extends File {
    preview: string; // Para la previsualización local
}

export interface CreateProductPayload {
    name: string;
    price: number;
    description: string;
    tags: string[];
    imageFiles: File[];
}

export interface FormPayload extends CreateProductPayload {
    currentImageUrls: string[]; // Añadido para la edición/frontend
}