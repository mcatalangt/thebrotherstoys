// BBTS‑inspired storefront template — React + Tailwind CSS (TypeScript / TSX)
// NOTE: This is an original, brand‑neutral UI that mimics the *structure* of a toy/e‑commerce site
// (header with search, category nav, promo banner, filters, product grid, sticky footer),
// without copying BBTS branding, logos, trademarks, or proprietary assets.
//
// How to use:
// 1) Ensure Tailwind CSS is set up in your project.
// 2) Drop this component into your app (Storefront.tsx) and render <Storefront />.
// 3) Replace placeholder data/images with your own. Wire up real cart/auth/search later.

import React, { useMemo, useState } from "react";

// Types
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number; // 0..5
  inStock: boolean;
  image: string;
  tags: string[];
  category: string;
}

// Simple helpers
const classNames = (
  ...c: Array<string | false | null | undefined>
): string => c.filter(Boolean).join(" ");

// Fake dataset (replace with API results)
const ALL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "1/12 Action Figure — Mecha Commander",
    brand: "MechaWorks",
    price: 39.99,
    rating: 4.6,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1585386959984-a41552231658?q=80&w=1400&auto=format&fit=crop",
    tags: ["New", "Preorder"],
    category: "Figuras de Acción",
  },
  {
    id: "2",
    name: "Collectors Statue — Dragon Warrior",
    brand: "MythicForge",
    price: 129.0,
    rating: 4.9,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=1400&auto=format&fit=crop",
    tags: ["En Stock"],
    category: "Cars",
  },
  {
    id: "3",
    name: "Model Kit — Space Cruiser Mk II",
    brand: "StarDock",
    price: 54.5,
    rating: 4.3,
    inStock: false,
    image:
      "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=1400&auto=format&fit=crop",
    tags: ["Sold Out"],
    category: "Marvel",
  },
  {
    id: "4",
    name: "Retro Console — 8‑bit Classic Mini",
    brand: "PixelWave",
    price: 89.99,
    rating: 4.2,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1541140134513-85a161dc4a00?q=80&w=1400&auto=format&fit=crop",
    tags: ["Hot"],
    category: "Hotwheels",
  },
  {
    id: "5",
    name: "Vinyl Figure — Astro Pup",
    brand: "Orbit Toys",
    price: 24.99,
    rating: 4.0,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1546778316-dfda79f1c0f0?q=80&w=1400&auto=format&fit=crop",
    tags: ["Exclusive"],
    category: "Transformers",
  },
  {
    id: "6",
    name: "1/6 Scale Figure — Cyber Agent",
    brand: "NeoFrame",
    price: 229.0,
    rating: 4.8,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1618355776464-8666794d2524?q=80&w=1400&auto=format&fit=crop",
    tags: ["Preorder"],
    category: "Figuras de Acción",
  },
  {
    id: "7",
    name: "Model Kit — Desert Walker",
    brand: "StarDock",
    price: 42.0,
    rating: 4.1,
    inStock: true,
    image:
      "https://images.unsplash.com/photo-1614680376739-414d95ff43df?q=80&w=1400&auto=format&fit=crop",
    tags: ["New"],
    category: "Marvel",
  },
  {
    id: "8",
    name: "Premium Statue — Forest Guardian",
    brand: "MythicForge",
    price: 349.0,
    rating: 5.0,
    inStock: false,
    image:
      "https://images.unsplash.com/photo-1626383043665-1c1601ad77d1?q=80&w=1400&auto=format&fit=crop",
    tags: ["Waitlist"],
    category: "Cars",
  },
];

const CATEGORIES = [
  "Nuevos Ingresos",
  "Pre-Ventas",
  "Figuras de Acción",
  "Cars",
  "Marvel",
  "Mcfarlane",
  "Hotwheels",
  "Transformers",
  "Ofertas y promociones",
] as const;

const MARCAS = [
  "Disney Cars",
  "Mcfarlane",
  "Hasbro",
  "Mattel",
  "Jada Toys",
  "Funko",
] as const;

const App: React.FC = () => {
  // UI state
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<string | null>(null);
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [price, setPrice] = useState<[number, number]>([0, 400]);
  const [sort, setSort] = useState<"featured" | "priceAsc" | "priceDesc" | "rating">(
    "featured"
  );

  const filtered: Product[] = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const matchQuery = query
        ? [p.name, p.brand, p.category]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true;
      const matchCategory = category
        ? p.category === category ||
          (category === "Nuevos Ingresos" && p.tags.includes("New")) ||
          (category === "Pre-Ventas" && p.tags.includes("Preorder"))
        : true;
      const matchBrand = brandFilters.length ? brandFilters.includes(p.brand) : true;
      const matchStock = onlyInStock ? p.inStock : true;
      const matchPrice = p.price >= price[0] && p.price <= price[1];
      return (
        matchQuery && matchCategory && matchBrand && matchStock && matchPrice
      );
    }).sort((a, b) => {
      switch (sort) {
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0; // featured
      }
    });
  }, [query, category, brandFilters, onlyInStock, price, sort]);

  const toggleBrand = (b: string) => {
    setBrandFilters((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Top announcement bar */}
      <div className="bg-red-600 text-white text-sm">
        <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
          <span className="font-medium tracking-wide">
            Envío gratuito en pedidos superiores a 500 Q (Capital).
          </span>
          <a href="#deals" className="underline underline-offset-2">
           Ofertas de hoy
          </a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-red-600" />
            <div className="text-xl font-black tracking-tight">BrothersToys</div>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="relative block">
              <input
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                placeholder="Busca figuras, marcas, series..."
                className="w-full rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 pl-10 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
              />
              <svg
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" />
              </svg>
            </label>
          </div>

          {/* Quick actions */}
          <nav className="flex items-center gap-4">
            <a className="text-sm hover:text-red-600" href="#account">
              Iniciar Sesión
            </a>
            <a className="text-sm hover:text-red-600" href="#orders">
              Ordenes
            </a>
            <button
              className="relative rounded-full border border-neutral-300 p-2 hover:border-red-500"
              aria-label="Cart"
              type="button"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="18" cy="20" r="1.5" />
                <path d="M3 4h2l2 12h11l2-8H6" />
              </svg>
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                2
              </span>
            </button>
          </nav>
        </div>

        {/* Category bar */}
        <div className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 overflow-x-auto">
            <ul className="flex gap-6 py-3 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setCategory(cat === category ? null : cat)}
                    className={classNames(
                      "whitespace-nowrap rounded-full px-4 py-1.5",
                      cat === category ? "bg-red-600 text-white" : "hover:bg-neutral-100"
                    )}
                    type="button"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      {/* Promo banner */}
      <section className="bg-gradient-to-r from-neutral-900 to-neutral-700">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6 md:grid-cols-3 items-center">
          <div className="md:col-span-2 text-white">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Scarface
            </h1>
            <p className="mt-2 text-neutral-200">
              Ya puedes reservar las ediciones limitadas. Asegura tus favoritas ahora.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="rounded-full bg-red-600 px-5 py-2.5 text-white font-semibold shadow hover:bg-red-700" type="button">
                Compra Pre-Ventas
              </button>
              <button className="rounded-full border border-white/30 px-5 py-2.5 text-white hover:bg-white/10" type="button">
                Mira los Nuevos Ingresos
              </button>
            </div>
          </div>
          <div className="relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/10">
            <img
              alt="promo"
              className="size-full object-cover"
              src="https://images.unsplash.com/photo-1520975661595-6457f1b7c3d3?q=80&w=1600&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 grid gap-8 md:grid-cols-[260px,1fr]">
        {/* Filters */}
        <aside className="hidden md:block">
          <div className="sticky top-28 space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold">Disponibilidad</h3>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setOnlyInStock(e.target.checked)
                  }
                />
                En Stock
              </label>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold">Marcas</h3>
              <div className="mt-3 space-y-2">
                {MARCAS.map((b) => (
                  <label key={b} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={brandFilters.includes(b)}
                      onChange={() => toggleBrand(b)}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="font-bold">Precio</h3>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="number"
                  className="w-24 rounded border border-neutral-300 px-2 py-1"
                  value={price[0]}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPrice([Number(e.target.value), price[1]])
                  }
                />
                <span className="text-neutral-500">—</span>
                <input
                  type="number"
                  className="w-24 rounded border border-neutral-300 px-2 py-1"
                  value={price[1]}
                  min={0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPrice([price[0], Number(e.target.value)])
                  }
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">{filtered.length} productos</p>
            <div className="flex items-center gap-2 text-sm">
              <label className="text-neutral-600">Sort</label>
              <select
                value={sort}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSort(e.target.value as typeof sort)
                }
                className="rounded border border-neutral-300 bg-white px-2 py-1"
              >
                <option value="featured">Destacado</option>
                <option value="priceAsc">Precio: De menor a mayor</option>
                <option value="priceDesc">Precio: De mayor a menor</option>
                <option value="rating">Clasificación</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  <img
                    alt={p.name}
                    src={p.image}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-neutral-900/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="line-clamp-2 font-semibold leading-tight">{p.name}</h3>
                  <p className="text-sm text-neutral-500">{p.brand}</p>
                  <div className="flex items-center justify-between">
                    <div className="font-bold">${p.price.toFixed(2)}</div>
                    <div
                      className="flex items-center gap-1 text-xs text-yellow-600"
                      aria-label={`${p.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={classNames(
                            "size-4",
                            i < Math.round(p.rating) ? "opacity-100" : "opacity-30"
                          )}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M12 17.3l-6.2 3.7 1.7-7.1-5.5-4.7 7.2-.6L12 2l2.8 6.6 7.2.6-5.5 4.7 1.7 7.1z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="flex-1 rounded-full bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
                      disabled={!p.inStock}
                      type="button"
                    >
                      {p.inStock ? "Add to Cart" : "Waitlist"}
                    </button>
                    <button
                      className="rounded-full border border-neutral-300 p-2 hover:border-neutral-500"
                      aria-label="Wishlist"
                      type="button"
                    >
                      <svg
                        className="size-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Newsletter + Footer */}
      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-black">Únete a la lista de coleccionistas</h3>
            <p className="mt-1 text-neutral-600">
              Recibe alertas sobre preventas, reposiciones y lanzamientos exclusivos.
            </p>
          </div>
          <form className="flex gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="tu@email.com"
              className="w-full rounded-full border border-neutral-300 px-4 py-2 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
            <button
              className="rounded-full bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700"
              type="submit"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-neutral-950 text-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-red-600" />
              <div className="text-lg font-black tracking-tight">BrothersToys</div>
            </div>
            <p className="mt-3 text-sm text-neutral-400">
              XFamily
            </p>
          </div>
          <div>
            <h4 className="font-semibold">Tienda</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Nuevos Ingresos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                 Pre-Ventas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Ofertas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Tarjetas de regalo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Ayuda</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Pedidos y devoluciones
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Envío
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold">Empresa</h4>
            <ul className="mt-3 space-y-2 text-sm text-neutral-300">
              <li>
                <a href="#" className="hover:text-white">
                  Acerca
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terminos
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-sm text-neutral-400">
          © {new Date().getFullYear()} BrothersToys. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
