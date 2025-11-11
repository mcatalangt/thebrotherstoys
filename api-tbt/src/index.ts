import express from 'express';
import cors from 'cors';



const app = express();
const userRoutes = require('./routes/products');
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] Solicitud: ${req.method} ${req.url}`);
    next(); 
});

app.get('/', (req, res) => {
    res.send('¡Bienvenido a la API Principal!');
});

app.use('/api/products', userRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

app.listen(PORT, () => {
  console.log(`api-tbt-v1 running on http://0.0.0.0:${PORT}`);
});