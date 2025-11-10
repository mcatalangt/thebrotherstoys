import express from 'express';
import { db, FieldValue } from "./db"; 
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  tags?: string[];
};

const app = express();
app.use(cors());
app.use(express.json());

let products: Product[] = [
  { id: '1', name: 'Demo', price: 9.99, description: 'Producto demo', images: [], tags: [] },
];

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

app.get('/products/:id', (req, res) => {
  const p = products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

app.post('/products', (req, res) => {
  const body = req.body as Partial<Product>;
  if (!body.name || typeof body.price !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const p: Product = {
    id: uuidv4(),
    name: body.name,
    price: body.price,
    description: body.description,
    images: body.images ?? [],
    tags: body.tags ?? []
  };
  products.unshift(p);
  res.status(201).json(p);
});

app.put('/products/:id', (req, res) => {
  const idx = products.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const patch = req.body as Partial<Product>;
  products[idx] = { ...products[idx], ...patch };
  res.json(products[idx]);
});

app.delete('/products/:id', (req, res) => {
  const before = products.length;
  products = products.filter((x) => x.id !== req.params.id);
  if (products.length === before) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(PORT, () => {
  console.log(`api-tbt-v1 running on http://0.0.0.0:${PORT}`);
});