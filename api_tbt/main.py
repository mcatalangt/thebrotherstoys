from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TBT API")

# CORS para desarrollo - ajustar orígenes en producción
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:5175", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Product(BaseModel):
    id: str
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None


class ProductCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None


# almacenamiento en memoria (dev)
_products: List[Product] = [
    Product(id="1", name="Demo", price=9.99, description="Producto demo", image=""),
]


@app.get("/products", response_model=List[Product])
def list_products():
    return _products


@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    for p in _products:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/products", response_model=Product, status_code=201)
def create_product(payload: ProductCreate):
    new = Product(id=str(uuid4()), **payload.dict())
    _products.insert(0, new)
    return new


@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, payload: ProductUpdate):
    for i, p in enumerate(_products):
        if p.id == product_id:
            updated = p.copy(update=payload.dict(exclude_unset=True))
            _products[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Product not found")


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: str):
    global _products
    next_list = [p for p in _products if p.id != product_id]
    if len(next_list) == len(_products):
        raise HTTPException(status_code=404, detail="Product not found")
    _products = next_list
    return None