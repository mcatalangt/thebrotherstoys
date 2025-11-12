import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

type Props = {
  initial?: Product | null;
  onSave: (p: Omit<Product, 'id'>, id?: string) => void;
  onCancel: () => void;
};

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setPrice(initial.price);
      setDescription(initial.description ?? '');
      setImageUrl(initial.imageUrl ?? []);
      setTags(initial.tags ?? []);
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl([]);
      setTags([]);
    }
  }, [initial]);

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const readers: Promise<string>[] = Array.from(files).map(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => {
      setImageUrl((prev) => [...prev, ...results]);
    });
  }

  function addTagFromInput() {
    const v = tagInput.trim();
    if (!v) return;
    if (!tags.includes(v)) setTags((s) => [...s, v]);
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags((s) => s.filter((x) => x !== t));
  }

  function removeImageAt(i: number) {
    setImageUrl((s) => s.filter((_, idx) => idx !== i));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || price === '') return;
    onSave({ name, price: Number(price), description, imageFiles: newImageFiles, tags }, initial?.id);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          className="mt-1 block w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Precio</label>
        <input
          type="number"
          step="0.01"
          className="mt-1 block w-full border rounded p-2"
          value={price}
          onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          className="mt-1 block w-full border rounded p-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Imágenes</label>
        <input type="file" multiple accept="image/*" onChange={handleFilesChange} className="mt-1" />
        <div className="mt-2 flex gap-2 flex-wrap">
          {imageUrl.map((src, i) => (
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

      <div>
        <label className="block text-sm font-medium">Tags</label>
        <div className="mt-1 flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTagFromInput();
              }
            }}
            placeholder="Escribe una tag y presiona Enter"
          />
          <button type="button" onClick={addTagFromInput} className="px-3 py-2 bg-gray-200 rounded">
            Add
          </button>
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {tags.map((t) => (
            <span key={t} className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-2">
              {t}
              <button type="button" onClick={() => removeTag(t)} className="text-sm">×</button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Guardar
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancelar
        </button>
      </div>
    </form>
  );
}