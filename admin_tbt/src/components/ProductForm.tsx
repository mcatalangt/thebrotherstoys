import React, { useState, useEffect } from 'react';
import { type Product, type FormPayload} from  '../types/index';

type Props = {
  initial?: Product | null;
  onSave: (p: Omit<FormPayload, 'id'>, id?: string) => void;
  onCancel: () => void;
};

// 1. RE-DEFINICIÓN del tipo para Previews
interface PreviewItem {
    name: string;
    previewUrl: string; // La URL Base64 o Blob URL
}

export default function ProductForm({ initial, onSave }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  
  // 2. ESTADO DE SUBIDA: Ahora es File[] (sin la propiedad 'preview')
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]); 
  
  // 3. ESTADO DE PREVIEWS: Solo para mostrar imágenes en el formulario
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([]);
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  
  // 4. CÁLCULO: Combinar URLs existentes y URLs de Previews (Base64)
  const allImagePreviews = [
      ...currentImageUrls, 
      ...imagePreviews.map(f => f.previewUrl)
  ];
  

  const [tags, setTags] = useState<string[]>([]);


  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setPrice(initial.price);
      setDescription(initial.description ?? '');
      setCurrentImageUrls(initial.imageUrl ?? []);
      setTags(initial.tags ?? []);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCurrentImageUrls([]);
      setTags([]);
    }
  }, [initial]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList) return;
    console.log('Selected files:', fileList);

    const fileArray = Array.from(fileList);
    const readers = fileArray.map(
            (file) =>
                new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.readAsDataURL(file); // Lee el Base64 para preview
                })
        );

      Promise.all(readers).then((results) => {
        
        // 5. ✅ CORRECCIÓN 1: Usar filesToUpload y fileArray
        setFilesToUpload((prev) => [...prev, ...fileArray]);
        
        // 6. ✅ CORRECCIÓN 2: Usar imagePreviews y crear el array de previews
        const newPreviews: PreviewItem[] = fileArray.map((file, index) => ({
            name: file.name,
            previewUrl: results[index] // Base64 URL
        }));

        setImagePreviews((prev) => [...prev, ...newPreviews]);
    });
  }



  function removeImageAt(i: number) {
    // 7. ✅ CORRECCIÓN 3: Separar la lógica de eliminación entre URLs existentes y Archivos nuevos
    const totalExisting = currentImageUrls.length;
    
    if (i < totalExisting) {
        // Es una URL existente (ya subida)
        setCurrentImageUrls((s) => s.filter((_, idx) => idx !== i));
    } else {
        // Es un archivo nuevo (en filesToUpload)
        const fileIndex = i - totalExisting;
        
        // Eliminar del array de subida
        setFilesToUpload((s) => s.filter((_, idx) => idx !== fileIndex));
        
        // Eliminar del array de previews
        setImagePreviews((s) => s.filter((_, idx) => idx !== fileIndex));
    }
  }

function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || price === '') return;

    // 1. Datos base del formulario
    const textPayload = { 
      name, 
      price: Number(price), 
      description, 
      tags 
    };

    // 2. CONSTRUCCIÓN DEL PAYLOAD FINAL (Omit<FormPayload, 'id'>)
    // Este objeto cumple el contrato de onSave al 100%.
    const payloadToSend: Omit<FormPayload, 'id'> = { 
        ...textPayload, 
        imageFiles: filesToUpload,       // ✅ Contiene los archivos binarios (File[])
        currentImageUrls: currentImageUrls // ✅ Contiene [] si es nuevo, o URLs si es edición.
    };

    // 3. Llamar a onSave (Aquí el error TS2741 debe desaparecer)
    onSave(payloadToSend, initial?.id);
}

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* ... Resto del formulario ... */}
      <div>
        <label className="block text-sm font-medium">Imágenes</label>
        <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="mt-1" />
        <div className="mt-2 flex gap-2 flex-wrap">
          {allImagePreviews.map((src, i) => (
            <div key={i} className="relative">
              <img src={src} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded border" />
              <button
                type="button"
                onClick={() => removeImageAt(i)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                title="Eliminar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* ... Resto del formulario ... */}
    </form>
  );
}