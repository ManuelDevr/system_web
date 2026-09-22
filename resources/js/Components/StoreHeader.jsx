import { formatStock } from '@/Utils/format';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const iconOf = (cat) => {
    const n = String(cat?.nombre || '').toLowerCase();
    if (/rack|soporte|tv|monitor|pantalla/.test(n)) return 'tv';
    if (/cinta|tape/.test(n)) return 'tape_measure';
    if (/caja|pack|cajon/.test(n)) return 'inventory_2';
    if (/pintura|paint|latex/.test(n)) return 'palette';
    if (/clavo|clavos|nail/i.test(n)) return 'handyman';
    if (
        /electric|electr|cable|convertidor|conversor|audio|video|hdmi|digital|tv/.test(
            n,
        )
    )
        return 'bolt';
    if (/gasfiteria|plumb|tuber|grifo|caño|llave/.test(n)) return 'plumbing';
    if (/herramient|tool/.test(n)) return 'hardware';
    if (/construccion|build|material/.test(n)) return 'construction';
    return 'folder_open';
};

const imgOf = (p) => {
    if (!p?.imagen_url) return 'https://via.placeholder.com/100?text=Img';
    return /^https?:\/\//.test(p.imagen_url)
        ? p.imagen_url
        : `/storage/${p.imagen_url}`;
};

export default function StoreHeader({ categorias = [], initialSearch = '' }) {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchBoxRef = useRef(null);

    const [megaRendered, setMegaRendered] = useState(false);
    const [megaOpen, setMegaOpen] = useState(false);
    const megaTimer = useRef(null);

    const [activeMainCat, setActiveMainCat] = useState(null);

    const urlParams = new URLSearchParams(window.location.search);
    const activeNavCat = urlParams.get('category') || '';

    useEffect(() => {
        if (categorias?.length) {
            if (
                activeMainCat === null ||
                !categorias.some((c) => c.id === activeMainCat)
            ) {
                setActiveMainCat(categorias[0].id);
            }
        }
    }, [categorias, activeMainCat]);

    const block =
        categorias?.find((c) => c.id === activeMainCat) ||
        categorias?.[0] ||
        null;

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${route('store.search')}?q=${encodeURIComponent(searchQuery.trim())}`,
                    { signal: controller.signal },
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                if (err.name !== 'AbortError') setSuggestions([]);
            }
        }, 250);
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = route('store.catalog', {
                search: searchQuery.trim(),
            });
        }
    };

    const openMega = () => {
        clearTimeout(megaTimer.current);
        setMegaRendered(true);
        requestAnimationFrame(() =>
            requestAnimationFrame(() => setMegaOpen(true)),
        );
    };

    const closeMega = () => {
        setMegaOpen(false);
        megaTimer.current = setTimeout(() => setMegaRendered(false), 200);
    };

    const SubRow = ({ cat, compact = false }) => {
        const d = cat.destacado;
        const href = d
            ? route('store.detail', d.id)
            : route('store.catalog', { category: cat.id });
        return (
            <Link
                href={href}
                className="group/sub flex items-center gap-2.5 rounded-lg p-1.5 transition-all hover:bg-white hover:shadow-sm"
            >
                <span
                    className={`${compact ? 'h-9 w-9' : 'h-11 w-11'} flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white`}
                >
                    <img
                        src={imgOf(d)}
                        alt={cat.nombre}
                        loading="lazy"
                        className="h-full w-full object-contain p-0.5"
                    />
                </span>
                <span className="min-w-0 flex-1">
                    <span
                        className={`block ${compact ? 'text-[11px]' : 'text-xs'} truncate font-bold text-slate-700 group-hover/sub:text-black`}
                    >
                        {cat.nombre}
                    </span>
                    <span className="block truncate text-[10px] font-semibold text-emerald-600">
                        Stock: {formatStock(d?.stock, d?.unidad_medida)}
                    </span>
                </span>
            </Link>
        );
    };

    return (
        <>
            {/* 1. Cabecera Principal (Main Header) */}
            <header className="relative z-50 w-full border-b border-slate-200 bg-white">
                <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-3 px-4 py-3 md:h-20 md:grid-cols-[minmax(0,1fr)_minmax(0,42rem)_minmax(0,1fr)] md:gap-4 md:px-6 md:py-0 lg:gap-6">
                    {/* Izquierda: Logo Principal */}
                    <Link
                        href={route('store.index')}
                        className="group flex items-center gap-2 justify-self-start text-2xl font-black uppercase tracking-tight text-black"
                    >
                        <span className="rounded-lg bg-[#fea619] px-2.5 py-1 text-base text-black shadow-sm transition-transform group-hover:scale-105">
                            CMA
                        </span>
                        <span className="font-extrabold tracking-wider transition-colors group-hover:text-[#855300]">
                            STORE
                        </span>
                    </Link>

                    {/* Centro: Barra de búsqueda ancha centrada */}
                    <div ref={searchBoxRef} className="relative w-full">
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center rounded-full border border-slate-300 bg-slate-50 p-1 shadow-inner transition-all focus-within:border-[#fea619] focus-within:ring-2 focus-within:ring-[#fea619]/20"
                        >
                            <span className="material-symbols-outlined pl-4 text-xl text-slate-400">
                                search
                            </span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border-none bg-transparent px-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                                placeholder="Buscar productos, marcas, herramientas..."
                                type="text"
                            />
                            <button
                                type="submit"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fea619] text-black shadow-md transition-transform hover:scale-105 hover:bg-[#ffb95f] active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl font-bold">
                                    search
                                </span>
                            </button>
                        </form>

                        {showSuggestions && searchQuery.trim() && (
                            <div className="absolute left-0 right-0 top-full z-[1000] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                                {suggestions.length > 0 ? (
                                    <ul className="max-h-96 overflow-y-auto py-2">
                                        {suggestions.map((p) => (
                                            <li key={p.id}>
                                                <Link
                                                    href={route(
                                                        'store.detail',
                                                        p.id,
                                                    )}
                                                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[#fea619]/10"
                                                >
                                                    <img
                                                        src={imgOf(p)}
                                                        alt={p.nombre}
                                                        className="h-12 w-12 rounded-lg border border-slate-100 bg-slate-50 object-contain"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-bold text-black">
                                                            {p.nombre}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500">
                                                            {p.marca?.nombre ||
                                                                'CMA'}{' '}
                                                            · SKU:{' '}
                                                            {p.sku || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-sm font-black text-[#855300]">
                                                        S/{' '}
                                                        {parseFloat(
                                                            p.precio_venta || 0,
                                                        ).toFixed(2)}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="px-4 py-4 text-xs text-slate-400">
                                        No se encontraron productos para "
                                        {searchQuery.trim()}".
                                    </p>
                                )}
                                <Link
                                    href={route('store.catalog', {
                                        search: searchQuery.trim(),
                                    })}
                                    className="block border-t border-slate-100 bg-slate-50 py-2.5 text-center text-xs font-bold text-[#855300] hover:bg-[#fea619]/10"
                                >
                                    Ver todos los resultados
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Derecha: Caja del Carrito de Compras (comentada por decisión del usuario)
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href={route('store.catalog')}
              className="flex items-center gap-3 bg-[#fea619]/10 hover:bg-[#fea619]/20 border border-[#fea619]/30 px-4 py-2 rounded-full transition-all group shadow-sm"
            >
              <div className="relative w-9 h-9 bg-[#fea619] text-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                <span className="material-symbols-outlined text-lg font-bold">shopping_bag</span>
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  0
                </span>
              </div>
              <span className="text-sm font-black text-black tracking-tight">S/ 0.00</span>
            </Link>
          </div>
          */}
                </div>

                {/* 2. Menú de Categorías (Navbar Azul Marino) */}
                <nav className="relative z-40 w-full bg-[#0f172a] text-white">
                    <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-2 px-4 text-xs font-bold md:px-6">
                        {/* Botón Hamburger "Productos" */}
                        <div
                            className="relative shrink-0 py-1"
                            onMouseEnter={openMega}
                            onMouseLeave={closeMega}
                        >
                            <Link
                                href={route('store.catalog')}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#fea619] px-4 py-2 font-black uppercase tracking-wider text-black shadow-md transition-all hover:bg-[#ffb95f]"
                            >
                                <span className="material-symbols-outlined text-lg font-black">
                                    menu
                                </span>
                                <span>Productos</span>
                                <span
                                    className={`material-symbols-outlined text-sm transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
                                >
                                    expand_more
                                </span>
                            </Link>

                            {/* VENTANA MODAL MEGAMENÚ: panel lateral izquierdo + panel derecho en 4 columnas */}
                            {megaRendered && block && (
                                <div
                                    className="absolute left-0 top-full z-50 -mt-1 w-[min(1180px,92vw)] origin-top-left rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl shadow-black/15 ring-1 ring-black/5 transition-all duration-200 ease-out"
                                    style={{
                                        opacity: megaOpen ? 1 : 0,
                                        transform: megaOpen
                                            ? 'translateY(0) scale(1)'
                                            : 'translateY(-8px) scale(0.98)',
                                        pointerEvents: megaOpen
                                            ? 'auto'
                                            : 'none',
                                    }}
                                >
                                    <div className="flex max-h-[70vh] overflow-hidden">
                                        {/* Panel Lateral Izquierdo: Categorías Principales */}
                                        <aside className="w-68 no-scrollbar shrink-0 overflow-y-auto rounded-l-2xl border-r border-slate-200 bg-[#f4f6f8] p-3 sm:w-72">
                                            {categorias.map((cat) => {
                                                const active =
                                                    block.id === cat.id;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onMouseEnter={() =>
                                                            setActiveMainCat(
                                                                cat.id,
                                                            )
                                                        }
                                                        className={`mb-1 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left transition-all ${
                                                            active
                                                                ? 'border border-slate-200 bg-white font-black text-[#855300] shadow-sm'
                                                                : 'text-slate-700 hover:bg-white/70'
                                                        }`}
                                                    >
                                                        <span className="flex min-w-0 items-center gap-3">
                                                            <span
                                                                className={`material-symbols-outlined text-lg ${active ? 'text-[#fea619]' : 'text-slate-400'} shrink-0`}
                                                            >
                                                                {iconOf(cat)}
                                                            </span>
                                                            <span className="truncate text-xs">
                                                                {cat.nombre}
                                                            </span>
                                                        </span>
                                                        <span
                                                            className={`material-symbols-outlined shrink-0 text-base ${active ? 'text-[#855300]' : 'text-slate-300 group-hover:text-slate-500'}`}
                                                        >
                                                            chevron_right
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </aside>

                                        {/* Panel Derecho: Categoría seleccionada con subcategorías en columnas */}
                                        <div className="no-scrollbar flex-1 overflow-y-auto p-6">
                                            <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                                <h3 className="flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-[#855300]">
                                                    <span className="material-symbols-outlined text-xl text-[#fea619]">
                                                        {iconOf(block)}
                                                    </span>
                                                    {block.nombre}
                                                </h3>
                                                <Link
                                                    href={route(
                                                        'store.catalog',
                                                        { category: block.id },
                                                    )}
                                                    className="flex shrink-0 items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#855300]"
                                                >
                                                    Ver todo{' '}
                                                    <span className="material-symbols-outlined text-sm">
                                                        arrow_forward
                                                    </span>
                                                </Link>
                                            </div>

                                            {block.children?.length > 0 ? (
                                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                    {block.children.map(
                                                        (sub) => (
                                                            <div key={sub.id}>
                                                                <div className="mb-2 flex items-start justify-between gap-2">
                                                                    <div className="border-l-[3px] border-[#2563eb] pl-2.5">
                                                                        <Link
                                                                            href={route(
                                                                                'store.catalog',
                                                                                {
                                                                                    category:
                                                                                        sub.id,
                                                                                },
                                                                            )}
                                                                            className="text-[11px] font-black uppercase tracking-wide text-slate-800 transition-colors hover:text-[#855300]"
                                                                        >
                                                                            {
                                                                                sub.nombre
                                                                            }
                                                                        </Link>
                                                                    </div>
                                                                    <Link
                                                                        href={route(
                                                                            'store.catalog',
                                                                            {
                                                                                category:
                                                                                    sub.id,
                                                                            },
                                                                        )}
                                                                        className="whitespace-nowrap text-[10px] font-bold text-[#855300] hover:underline"
                                                                    >
                                                                        Ver todo
                                                                    </Link>
                                                                </div>
                                                                <ul className="space-y-0.5">
                                                                    {sub
                                                                        .productos
                                                                        ?.length ? (
                                                                        sub.productos
                                                                            .slice(
                                                                                0,
                                                                                4,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    p,
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            p.id
                                                                                        }
                                                                                    >
                                                                                        <Link
                                                                                            href={route(
                                                                                                'store.detail',
                                                                                                p.id,
                                                                                            )}
                                                                                            className="block truncate py-1 text-xs text-slate-500 transition-colors hover:font-semibold hover:text-[#855300]"
                                                                                        >
                                                                                            {
                                                                                                p.nombre
                                                                                            }
                                                                                        </Link>
                                                                                    </li>
                                                                                ),
                                                                            )
                                                                    ) : (
                                                                        <li className="py-1 text-[11px] text-slate-300">
                                                                            Próximamente
                                                                        </li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <ul className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                    {block.productos?.length ? (
                                                        block.productos.map(
                                                            (p) => (
                                                                <li key={p.id}>
                                                                    <Link
                                                                        href={route(
                                                                            'store.detail',
                                                                            p.id,
                                                                        )}
                                                                        className="block truncate py-1.5 text-xs text-slate-500 transition-colors hover:font-semibold hover:text-[#855300]"
                                                                    >
                                                                        {
                                                                            p.nombre
                                                                        }
                                                                    </Link>
                                                                </li>
                                                            ),
                                                        )
                                                    ) : (
                                                        <li className="py-1 text-xs text-slate-300">
                                                            Próximamente
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Categorías Principales Horizontales con Dropdown Simple */}
                        <div className="hidden flex-1 items-center gap-1 overflow-visible px-2 py-1 md:flex">
                            <Link
                                href={route('store.catalog')}
                                className="shrink-0 whitespace-nowrap px-3 py-1.5 text-slate-200 transition-colors hover:text-[#fea619]"
                            >
                                Inicio
                            </Link>
                            {categorias &&
                                categorias.slice(0, 4).map((cat) => {
                                    const isActive =
                                        activeNavCat === String(cat.id);
                                    return (
                                        <div
                                            key={cat.id}
                                            className="group/cat relative shrink-0"
                                        >
                                            <Link
                                                href={route('store.catalog', {
                                                    category: cat.id,
                                                })}
                                                className={`flex cursor-pointer items-center gap-1 whitespace-nowrap px-3 py-1.5 text-[11px] uppercase tracking-wider transition-colors ${
                                                    isActive
                                                        ? 'text-[#fea619]'
                                                        : 'text-slate-200 hover:text-[#fea619]'
                                                }`}
                                            >
                                                <span>{cat.nombre}</span>
                                                {cat.children &&
                                                    cat.children.length > 0 && (
                                                        <span
                                                            className={`material-symbols-outlined text-[14px] transition-all ${isActive ? 'text-[#4ade80]' : 'text-slate-400 group-hover/cat:rotate-180 group-hover/cat:text-[#fea619]'}`}
                                                        >
                                                            expand_more
                                                        </span>
                                                    )}
                                            </Link>

                                            {/* Dropdown simple: lista vertical de solo texto */}
                                            {cat.children &&
                                                cat.children.length > 0 && (
                                                    <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 top-full z-50 hidden w-56 rounded-md border border-slate-200 bg-white pt-2 text-slate-800 shadow-xl duration-150 group-hover/cat:block">
                                                        <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                                                            <Link
                                                                href={route(
                                                                    'store.catalog',
                                                                    {
                                                                        category:
                                                                            cat.id,
                                                                    },
                                                                )}
                                                                className={`flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs font-black transition-colors hover:bg-[#fea619]/10 ${
                                                                    isActive
                                                                        ? 'text-[#855300]'
                                                                        : 'text-slate-800'
                                                                }`}
                                                            >
                                                                Todos
                                                                {isActive && (
                                                                    <span className="material-symbols-outlined text-sm text-[#4ade80]">
                                                                        check
                                                                    </span>
                                                                )}
                                                            </Link>
                                                            {cat.children.map(
                                                                (sub) => (
                                                                    <Link
                                                                        key={
                                                                            sub.id
                                                                        }
                                                                        href={route(
                                                                            'store.catalog',
                                                                            {
                                                                                category:
                                                                                    sub.id,
                                                                            },
                                                                        )}
                                                                        className="block px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-black"
                                                                    >
                                                                        {
                                                                            sub.nombre
                                                                        }
                                                                    </Link>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    );
                                })}
                            <Link
                                href={route('store.catalog')}
                                className="ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl bg-white/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#fea619] hover:text-black"
                            >
                                <span>Otros</span>
                                <span className="material-symbols-outlined text-sm">
                                    arrow_forward
                                </span>
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
        </>
    );
}
