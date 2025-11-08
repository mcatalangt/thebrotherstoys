export type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[]; // ahora puede tener varias imágenes (data URLs o URLs)
  tags?: string[];   // etiquetas del producto
};

