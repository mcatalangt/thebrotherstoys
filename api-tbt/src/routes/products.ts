
const express = require('express');
//import { db, FieldValue } from "../db"; 
import { db, bucket, FieldValue } from '../firebase-config'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CollectionReference } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router();
import { Request, Response } from 'express';
import multer from 'multer'; 



const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });


interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl: string[];
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

router.post('/', upload.array('files'), async (req: Request, res: Response) => {
    
    const files = req.files as Express.Multer.File[]; 
    const body = req.body;
    let urlsToKeep: string[] = [];
    const price = Number(body.price);
    let productTags: string[] = [];
    const imageUrls: string[] = [];
    
    

    if (body.tags && typeof body.tags === 'string') {
        try {
            const parsedTags = JSON.parse(body.tags); 
            
            if (Array.isArray(parsedTags)) {
                productTags = parsedTags;
            } else {
                console.warn('JSON.parse(tags) no devolvió un array.');
            }
        } catch (e) {
            console.error('Error al parsear el string de tags a JSON:', e);
        }
    }

    if (body.currentImageUrls) {
        urlsToKeep = JSON.parse(body.currentImageUrls); 
    }

    if (!files || files.length === 0) {
        return res.status(400).send('No se proporcionaron archivos.');
    }
if (!body.name || isNaN(price)) {
        return res.status(400).json({ error: "Invalid payload or missing name/price" }); 
    }

    try {
        
        const uploadPromises = files.map(async (file, index) => {

            const fileExtension = file.originalname.split('.').pop();
            const uniqueFileName = `${Date.now()}-${index}.${fileExtension}`;
            const storagePath = `products/${uniqueFileName}`;
            const storageFile = bucket.file(storagePath);

            await storageFile.save(file.buffer, {
                metadata: { contentType: file.mimetype },
                public: true 
            });

            return `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;
        });

        const imageUrls: string[] = await Promise.all(uploadPromises);



        const p: Product = {
            id: uuidv4(),
            name: body.name,
            price: price,
            description: body.description || "",
            imageUrl: imageUrls, 
            tags: productTags ?? [],
            createdAt: FieldValue.serverTimestamp(),
        };

        await db.collection("products").doc(p.id).set(p);

        console.log(`✅ Product ${p.id} saved to Firestore with ${imageUrls.length} images.`);
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