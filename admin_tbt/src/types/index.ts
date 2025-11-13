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

    // ✅ SOLO imageFiles (los nuevos archivos para subir)
    imageFiles: File[];
}

// Y tu interfaz para EDICIÓN (o FormPayload completo) debe ser:
export interface FormPayload extends CreateProductPayload {
    // Para la edición, incluimos las URLs que ya están en el servidor
    currentImageUrls: string[]; 
}
// Nota: Si 'Product' tiene imageUrl: string[], ya está bien.