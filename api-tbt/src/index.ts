import express from 'express';
import { db, FieldValue } from "./db"; 
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';



const app = express();
app.use(cors());
app.use(express.json());

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
  tags: string[];
}

app.get("/", (_, res) => res.send("OK"));

app.get("/healthz", async (_req, res) => {
  try {
    const doc = await db.doc("health/check").get();
    res.json({ ok: true, exists: doc.exists });
  } catch (e:any) {
    console.error("HEALTHZ ERROR:", e.code, e.message);
    res.status(500).json({ ok: false, code: e.code, msg: e.message });
  }
});

app.get("/products", async (req, res) => {
  const snapshot = await db.collection("products").get();
  console.log("Fetched products from Firestore:", snapshot.size);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(data);
});

app.get("/products/:id", async (req, res) => {
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

app.post("/products", async (req, res) => {
  try {
    const body = req.body as Partial<Product>;

    // Validación mínima
    if (!body.name || typeof body.price !== "number") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Construir producto
    const p: Product = {
      id: uuidv4(),
      name: body.name,
      price: body.price,
      description: body.description || "",
      images: body.images ?? [],
      tags: body.tags ?? [],
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

app.put("/products/:id", async (req, res) => {
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

//app.delete('/products/:id', (req, res) => {
//  const before = products.length;
//  products = products.filter((x) => x.id !== req.params.id);
//  if (products.length === before) return res.status(404).json({ error: 'Product not found' });
//  res.status(204).send();
//});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(PORT, () => {
  console.log(`api-tbt-v1 running on http://0.0.0.0:${PORT}`);
});