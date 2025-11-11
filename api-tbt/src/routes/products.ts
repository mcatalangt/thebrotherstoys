
const express = require('express');
//import { db, FieldValue } from "../db"; 
import { db, bucket, FieldValue } from '../../firebase-config'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CollectionReference } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
const upload = multer({ 
    // Configura Multer para almacenar el archivo en la memoria del servidor 
    // antes de enviarlo a Storage.
    storage: multer.memoryStorage() 
});
import { Request, Response } from 'express';
import multer from 'multer';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  tags: string[];
  createdAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
  updatedAt?: FirebaseFirestore.Timestamp | FirebaseFirestore.FieldValue;
}

interface MulterRequest extends Request {
    file: any;
}

router.get("/", async (req: Request, res: Response) => {
  const snapshot = await db.collection("products").get();
  console.log("Fetched products from Firestore:", snapshot.size);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(data);
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const docRef = db.collection("products").doc(id); // 🔹 colección 'products'
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ id: doc.id, ...doc.data() }); // 🔹 devolvemos el documento
  } catch (error: any) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", upload.single('file'), async (req: MulterRequest, res: Response) => {
    const file = req.file;
    if (!file) {
        return res.status(400).send('No se proporcionó ningún archivo.');
    }
  try {
    const body = req.body as Partial<Product>;

    // Validación mínima
    if (!body.name || typeof body.price !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }


    const fileName = `products/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
            public: true // Hace el archivo público
        });

        // 3. OBTENER LA URL PÚBLICA DE LA IMAGEN
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;


        
    // Construir producto
    const p: Product = {
      id: uuidv4(),
      name: body.name,
      price: body.price,
      description: body.description || "",
      images: imageUrl ? [imageUrl] : [],
      tags: body.tags ?? [],
      createdAt: FieldValue.serverTimestamp(),
    };

    // 🔹 Guardar en Firestore (colección "products")
    await db.collection("products").doc(p.id).set(p);

    console.log(`✅ Product ${p.id} saved to Firestore`);
    res.status(201).json(p);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const ALLOWED_FIELDS = new Set(["name", "price", "description", "images", "tags", "stock"]);

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const ref = db.collection("products").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const patch: Record<string, any> = {};
    for (const [k, v] of Object.entries(req.body ?? {})) {
      if (ALLOWED_FIELDS.has(k)) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    if (patch.price !== undefined && typeof patch.price !== "number") {
      return res.status(400).json({ error: "price must be a number" });
    }
    if (patch.images && !Array.isArray(patch.images)) {
      return res.status(400).json({ error: "images must be an array" });
    }
    if (patch.tags && !Array.isArray(patch.tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }

    patch.updatedAt = FieldValue.serverTimestamp();

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    return res.json({ id: updated.id, ...updated.data() });
  } catch (err: any) {
    console.error("PUT /products/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const ref = db.collection("products").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    await ref.delete();

    console.log(`🗑️ Product ${id} deleted`);
    res.status(204).send(); // 204 No Content
  } catch (err: any) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;