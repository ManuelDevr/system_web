import WhatsAppButton from '@/Components/Store/WhatsAppButton';
import StoreFooter from '@/Components/StoreFooter';
import StoreHeader from '@/Components/StoreHeader';
import { formatStock } from '@/Utils/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const FILTER_THEMES = [
    {
        match: ['rack', 'soporte', 'soporte de tv', 'mount'],
        hideSubcats: false,
        attrSections: [
            {
                key: 'pantalla',
                label: 'Tamaño de Pantalla',
                options: ['32"-55"', '65"-85"'],
            },
        ],
    },
    {
        match: [
            'convertidor',
            'conversor',
            'electronica',
            'audio',
            'video',
            'tv',
            'hdmi',
            'digital',
            'dvb',
            'amplificador',
        ],
        hideSubcats: false,
        attrSections: [
            {
                key: 'resolucion',
                label: 'Resolución',
                options: ['HD', 'Full HD', '4K', '8K'],
            },
            {
                key: 'digital',
                label: 'Producto digital',
                options: ['Digital', 'Analógico', 'Wi-Fi', 'Bluetooth'],
            },
        ],
    },
];

export default function StoreCatalog({
    productos,
    categorias,
    marcas,
    priceRange,
}) {
    const { webConfig = {} } = usePage().props;
    const whatsappCheckout = webConfig.whatsapp_checkout_only !== false;
    const whatsappPhone = webConfig.whatsapp_phone;
    const [viewMode, setViewMode] = useState('grid');
    const [openSections, setOpenSections] = useState({
        categorias: true,
        marca: true,
        precio: true,
    });
    const [expandedCat, setExpandedCat] = useState(null);
    const priceDebounce = useRef(null);

    const urlParams = new URLSearchParams(window.location.search);
    const activeSearch = urlParams.get('search') || '';
    const activeCategory = urlParams.get('category') || '';
    const activeBrand = urlParams.get('brand') || '';
    const activeSort = urlParams.get('sort') || '';
    const activeMinPrice = urlParams.get('min_price') || '';
    const activeMaxPrice = urlParams.get('max_price') || '';

    const maxPrice = priceRange?.max || 2000;
    const minPriceFloor = priceRange?.min || 0;

    const activeAttrs = {};
    urlParams.forEach((v, k) => {
        const m = k.match(/^attrs\[(.+)\]$/);
        if (m && v) activeAttrs[m[1]] = v;
    });

    const [searchQuery, setSearchQuery] = useState(activeSearch);
    const [draftMin, setDraftMin] = useState(activeMinPrice);
    const [draftMax, setDraftMax] = useState(activeMaxPrice);
    const [sliderMax, setSliderMax] = useState(activeMaxPrice || maxPrice);

    useEffect(() => {
        setSearchQuery(activeSearch);
        setDraftMin(activeMinPrice);
        setDraftMax(activeMaxPrice);
        setSliderMax(activeMaxPrice || maxPrice);
    }, [activeSearch, activeMinPrice, activeMaxPrice, maxPrice]);

    const productList = productos?.data || productos || [];

    const activeFilters = {
        search: activeSearch,
        category: activeCategory,
        brand: activeBrand,
        sort: activeSort,
        min_price: activeMinPrice,
        max_price: activeMaxPrice,
    };

    const hasActiveFilters =
        Object.values(activeFilters).some((v) => v !== '') ||
        Object.keys(activeAttrs).length > 0;

    const findCategoryName = (id) => {
        if (!categorias) return null;
        for (const c of categorias) {
            if (String(c.id) === String(id)) return c.nombre;
            const sub = c.children?.find((ch) => String(ch.id) === String(id));
            if (sub) return sub.nombre;
        }
        return null;
    };

    const activeCategoryName = findCategoryName(activeCategory);

    const theme = activeCategoryName
        ? FILTER_THEMES.find((t) =>
              t.match.some((k) => activeCategoryName.toLowerCase().includes(k)),
          )
        : null;

    const findCatType = (id) => {
        if (!categorias) return null;
        for (const cat of categorias) {
            if (String(cat.id) === String(id)) return 'parent';
            if (cat.children?.some((ch) => String(ch.id) === String(id)))
                return 'sub';
        }
        return null;
    };
    const catType = activeCategory ? findCatType(activeCategory) : null;

    const sections = [];
    if (theme) {
        if (!theme.hideSubcats)
            sections.push({ type: 'cats', label: 'Sub-Categoría' });
        theme.attrSections.forEach((s) =>
            sections.push({ type: 'attrs', ...s }),
        );
        sections.push({ type: 'brand', label: 'Marca' });
        sections.push({ type: 'price', label: 'Gama de Precios' });
    } else {
        sections.push({ type: 'cats', label: 'Sub-Categoría' });
        sections.push({ type: 'brand', label: 'Marca' });
        sections.push({ type: 'price', label: 'Gama de Precios' });
    }

    const attrOptionLabel = (key, value) => {
        const sec = theme?.attrSections.find((s) => s.key === key);
        return sec ? `${sec.label}: ${value}` : `${key}: ${value}`;
    };

    const chips = [];
    if (activeSearch)
        chips.push({ key: 'search', label: `Búsqueda: ${activeSearch}` });
    if (activeCategory)
        chips.push({
            key: 'category',
            label: activeCategoryName
                ? `Categoría: ${activeCategoryName}`
                : `Categoría: #${activeCategory}`,
        });
    if (activeBrand)
        chips.push({
            key: 'brand',
            label: `Marca: ${marcas?.find((m) => String(m.id) === String(activeBrand))?.nombre || `#${activeBrand}`}`,
        });
    if (activeMinPrice)
        chips.push({
            key: 'min_price',
            label: `Precio mín: S/ ${activeMinPrice}`,
        });
    if (activeMaxPrice)
        chips.push({
            key: 'max_price',
            label: `Precio máx: S/ ${activeMaxPrice}`,
        });
    Object.entries(activeAttrs).forEach(([k, v]) => {
        chips.push({ key: `attr_${k}`, label: attrOptionLabel(k, v) });
    });

    const applyFilters = (changes) => {
        const q = { ...activeFilters, ...changes };
        Object.keys(q).forEach((k) => {
            if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k];
            if (typeof q[k] === 'object' && Object.keys(q[k]).length === 0)
                delete q[k];
        });
        delete q.page;
        router.get(route('store.catalog'), q, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleAttr = (sectionKey, option) => {
        const next = { ...activeAttrs };
        if (next[sectionKey] === option) delete next[sectionKey];
        else next[sectionKey] = option;
        applyFilters({ attrs: next });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search: searchQuery.trim() });
    };

    const toggleCategory = (id) => {
        applyFilters({
            category: activeCategory === String(id) ? '' : String(id),
        });
    };

    const toggleExpandCat = (id) => {
        setExpandedCat((prev) => (prev === id ? null : id));
    };

    const toggleBrand = (id) => {
        applyFilters({ brand: activeBrand === String(id) ? '' : String(id) });
    };

    const handleSort = (e) => {
        applyFilters({ sort: e.target.value });
    };

    const handleMinInput = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if (Number(val) < 0) val = '';
        setDraftMin(val);
        clearTimeout(priceDebounce.current);
        priceDebounce.current = setTimeout(() => {
            applyFilters({ min_price: val });
        }, 500);
    };

    const handleMaxInput = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, '');
        if (Number(val) < 0) val = '';
        setDraftMax(val);
        setSliderMax(val ? Math.min(Number(val), maxPrice) : maxPrice);
        clearTimeout(priceDebounce.current);
        priceDebounce.current = setTimeout(() => {
            applyFilters({ max_price: val });
        }, 500);
    };

    const handlePriceSlider = (e) => {
        const val = e.target.value;
        setSliderMax(val);
        setDraftMax(val);
        clearTimeout(priceDebounce.current);
        priceDebounce.current = setTimeout(() => {
            applyFilters({ max_price: val });
        }, 300);
    };

    const removeFilter = (key) => {
        if (key === 'category') return applyFilters({ category: '' });
        if (key === 'brand') return applyFilters({ brand: '' });
        if (key === 'search') {
            setSearchQuery('');
            return applyFilters({ search: '' });
        }
        if (key === 'min_price') {
            setDraftMin('');
            return applyFilters({ min_price: '' });
        }
        if (key === 'max_price') {
            setDraftMax('');
            setSliderMax(maxPrice);
            return applyFilters({ max_price: '' });
        }
        if (key.startsWith('attr_')) {
            const attrKey = key.slice(5);
            const next = { ...activeAttrs };
            delete next[attrKey];
            return applyFilters({ attrs: next });
        }
    };

    const cleanFilters = () => {
        setSearchQuery('');
        setDraftMin('');
        setDraftMax('');
        setSliderMax(maxPrice);
        router.get(
            route('store.catalog'),
            {},
            { preserveState: true, replace: true },
        );
    };

    const toggleSection = (key) => {
        setOpenSections((s) => ({ ...s, [key]: !s[key] }));
    };

    const goToPage = (page) => {
        const q = { ...activeFilters };
        Object.keys(q).forEach((k) => {
            if (q[k] === '' || q[k] === null || q[k] === undefined) delete q[k];
        });
        router.get(
            route('store.catalog'),
            { ...q, page },
            { preserveState: true, replace: false },
        );
    };

    const currentPrice = (item) => parseFloat(item.precio_venta || 0);
    const oldPriceOf = (item) => {
        const cur = currentPrice(item);
        const raw = item.old_price ?? item.precio_anterior;
        if (raw) {
            const val = parseFloat(raw);
            if (Number.isFinite(val) && val > 0 && val > cur) return val;
        }
        const rate = parseFloat(item.tasa_descuento || 0);
        if (rate > 0 && rate < 100 && cur > 0) return cur / (1 - rate / 100);
        return null;
    };
    const discountOf = (item) => {
        const old = oldPriceOf(item);
        const cur = currentPrice(item);
        if (old && old > cur && cur > 0)
            return Math.round(((old - cur) / old) * 100);
        const rate = parseFloat(item.tasa_descuento || 0);
        return rate > 0 && rate < 100 ? Math.round(rate) : null;
    };
    const productImg = (item) => {
        if (!item.imagen_url)
            return 'https://via.placeholder.com/300?text=Sin+Imagen';
        return /^https?:\/\//.test(item.imagen_url)
            ? item.imagen_url
            : `/storage/${item.imagen_url}`;
    };

    const sectionIsOpen = (key) => openSections[key] !== false;

    const sectionHeader = (key, label) => (
        <button
            onClick={() => toggleSection(key)}
            className="flex w-full cursor-pointer items-center justify-between py-1 text-left"
        >
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                {label}
            </span>
            <span
                className={`material-symbols-outlined text-base text-slate-400 transition-transform duration-200 ${sectionIsOpen(key) ? 'rotate-180' : ''}`}
            >
                expand_more
            </span>
        </button>
    );

    const renderSection = (sec) => {
        if (sec.type === 'cats') {
            const key = 'categorias';

            if (catType === 'parent' || catType === 'sub') {
                const parentCat =
                    catType === 'parent'
                        ? categorias.find(
                              (c) => String(c.id) === String(activeCategory),
                          )
                        : categorias.find((c) =>
                              c.children?.some(
                                  (ch) =>
                                      String(ch.id) === String(activeCategory),
                              ),
                          );
                const parentId =
                    catType === 'parent'
                        ? activeCategory
                        : parentCat
                          ? String(parentCat.id)
                          : null;
                if (!parentCat) return null;
                const isParentActive = catType === 'parent';
                return (
                    <div key={key} className="border-b border-slate-100 py-2">
                        {sectionHeader(key, sec.label)}
                        {sectionIsOpen(key) && (
                            <div className="mt-1 space-y-0.5 text-sm font-medium">
                                <button
                                    onClick={() => toggleCategory(parentId)}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${isParentActive ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:bg-slate-50 hover:text-black'}`}
                                >
                                    <span>Todas</span>
                                </button>
                                {parentCat.children?.map((sub) => (
                                    <button
                                        key={sub.id}
                                        onClick={() => toggleCategory(sub.id)}
                                        className={`w-full cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-left transition-colors ${activeCategory === String(sub.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
                                    >
                                        {sub.nombre}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div key={key} className="border-b border-slate-100 py-2">
                    {sectionHeader(key, sec.label)}
                    {sectionIsOpen(key) && (
                        <div className="mt-1 space-y-0.5 text-sm font-medium">
                            <button
                                onClick={() => toggleCategory('')}
                                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${!activeCategory ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:bg-slate-50 hover:text-black'}`}
                            >
                                <span>Todas</span>
                            </button>
                            {categorias?.map((cat) => (
                                <div key={cat.id} className="space-y-0.5">
                                    <button
                                        onClick={() =>
                                            cat.children?.length
                                                ? toggleExpandCat(cat.id)
                                                : toggleCategory(cat.id)
                                        }
                                        className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${activeCategory === String(cat.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-600 hover:bg-slate-50 hover:text-black'}`}
                                    >
                                        <span className="truncate">
                                            {cat.nombre}
                                        </span>
                                        {cat.children?.length > 0 && (
                                            <span
                                                className={`material-symbols-outlined shrink-0 text-sm text-slate-400 transition-transform duration-200 ${expandedCat === cat.id ? 'rotate-180' : ''}`}
                                            >
                                                expand_more
                                            </span>
                                        )}
                                    </button>
                                    {expandedCat === cat.id &&
                                        cat.children?.length > 0 && (
                                            <div className="ml-4 space-y-0.5 border-l-2 border-[#fea619]/30 pl-3">
                                                {cat.children.map((sub) => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() =>
                                                            toggleCategory(
                                                                sub.id,
                                                            )
                                                        }
                                                        className={`w-full cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-left transition-colors ${activeCategory === String(sub.id) ? 'bg-[#fea619]/15 font-bold text-black' : 'text-slate-500 hover:bg-slate-50 hover:text-black'}`}
                                                    >
                                                        {sub.nombre}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (sec.type === 'attrs') {
            const key = `attrs_${sec.key}`;
            return (
                <div key={key} className="border-b border-slate-100 py-2">
                    {sectionHeader(key, sec.label)}
                    {sectionIsOpen(key) && (
                        <div className="mt-1 space-y-1.5 text-sm font-medium">
                            {sec.options.map((opt) => (
                                <label
                                    key={opt}
                                    className="flex cursor-pointer items-center gap-2.5 transition-colors hover:text-black"
                                >
                                    <input
                                        type="checkbox"
                                        checked={activeAttrs[sec.key] === opt}
                                        onChange={() =>
                                            toggleAttr(sec.key, opt)
                                        }
                                        className="rounded border-slate-300 accent-[#fea619] focus:ring-[#fea619]/50"
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (sec.type === 'brand') {
            const key = 'marca';
            return (
                <div key={key} className="border-b border-slate-100 py-2">
                    {sectionHeader(key, sec.label)}
                    {sectionIsOpen(key) && (
                        <div className="no-scrollbar mt-1 max-h-64 space-y-1.5 overflow-y-auto pr-1 text-sm font-medium">
                            {marcas?.length > 0 ? (
                                marcas.map((m) => (
                                    <label
                                        key={m.id}
                                        className="flex cursor-pointer items-center gap-2.5 transition-colors hover:text-black"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={
                                                activeBrand === String(m.id)
                                            }
                                            onChange={() => toggleBrand(m.id)}
                                            className="rounded border-slate-300 accent-[#fea619] focus:ring-[#fea619]/50"
                                        />
                                        <span className="truncate">
                                            {m.nombre}
                                        </span>
                                    </label>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400">
                                    No hay marcas registradas.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (sec.type === 'price') {
            const key = 'precio';
            const range = Math.max(1, maxPrice - minPriceFloor);
            const step = range < 100 ? (range < 50 ? 1 : 5) : 50;
            const handleKeyDown = (e) => {
                if (
                    e.key === '-' ||
                    e.key === 'e' ||
                    e.key === 'E' ||
                    e.key === '+' ||
                    e.key === ','
                )
                    e.preventDefault();
            };
            const pct =
                maxPrice > minPriceFloor
                    ? ((Number(sliderMax || minPriceFloor) - minPriceFloor) /
                          (maxPrice - minPriceFloor)) *
                      100
                    : 100;
            return (
                <div key={key} className="py-2">
                    {sectionHeader(key, sec.label)}
                    {sectionIsOpen(key) && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2">
                                <div className="flex w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition-colors focus-within:border-[#fea619]">
                                    <span className="text-[10px] font-black text-slate-400">
                                        S/
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={maxPrice}
                                        value={draftMin}
                                        onChange={handleMinInput}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Min"
                                        className="no-spinner w-full bg-transparent text-xs font-bold placeholder-slate-300 outline-none"
                                    />
                                </div>
                                <span className="text-xs text-slate-400">
                                    –
                                </span>
                                <div className="flex w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition-colors focus-within:border-[#fea619]">
                                    <span className="text-[10px] font-black text-slate-400">
                                        S/
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={maxPrice}
                                        value={draftMax}
                                        onChange={handleMaxInput}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Max"
                                        className="no-spinner w-full bg-transparent text-xs font-bold placeholder-slate-300 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="relative mt-5">
                                <input
                                    type="range"
                                    min={minPriceFloor}
                                    max={maxPrice}
                                    step={step}
                                    value={sliderMax}
                                    onChange={handlePriceSlider}
                                    className="w-full cursor-pointer accent-[#fea619]"
                                    style={{ height: '4px' }}
                                />
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-500">
                                <span>
                                    S/ {Number(minPriceFloor).toLocaleString()}
                                </span>
                                <span className="font-extrabold text-[#855300]">
                                    S/{' '}
                                    {Number(
                                        sliderMax || minPriceFloor,
                                    ).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#fea619]/30">
            <Head title="Catálogo de Productos - CMA Store">
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <StoreHeader
                key={activeSearch}
                categorias={categorias}
                initialSearch={activeSearch}
            />

            <main className="mx-auto w-full max-w-[1280px] flex-grow px-6 py-8">
                {/* Banner Promocional */}
                <section className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e0532e] via-[#c8451e] to-[#932a10] shadow-xl">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-[90px]"></div>
                    <div className="pointer-events-none absolute -bottom-12 left-1/4 h-48 w-48 rounded-full bg-black/20 blur-[80px]"></div>

                    <div className="relative z-10 flex w-full flex-col items-center justify-between gap-6 px-6 py-6 sm:px-10 lg:h-[150px] lg:flex-row lg:gap-4 lg:px-12">
                        {/* Bloque Izquierdo: Textos Promocionales */}
                        <div className="max-w-md shrink-0 text-center lg:text-left">
                            <h1 className="text-lg font-black leading-tight text-white sm:text-xl lg:text-2xl">
                                Innovación y Calidad en Racks y Ferretería
                            </h1>
                            <p className="mt-1.5 text-xs font-semibold text-white/90 sm:text-sm">
                                Lo último en soportes de TV y herramientas{' '}
                                <span className="inline-block rounded-full bg-black px-2.5 py-1 align-middle text-[10px] font-black uppercase tracking-wider text-white shadow">
                                    está aquí
                                </span>
                            </p>
                        </div>

                        {/* Bloque Centro: Muestra de Productos */}
                        <div className="hidden shrink-0 items-center justify-center gap-3 md:flex">
                            {productList.slice(0, 4).map((item) => {
                                const thumbUrl = item.imagen_url
                                    ? /^https?:\/\//.test(item.imagen_url)
                                        ? item.imagen_url
                                        : `/storage/${item.imagen_url}`
                                    : 'https://via.placeholder.com/100?text=CMA';
                                return (
                                    <img
                                        key={item.id}
                                        src={thumbUrl}
                                        alt={item.nombre}
                                        className="h-14 w-14 rounded-xl bg-white/95 object-contain p-1.5 shadow-md ring-1 ring-white/40 transition-transform hover:rotate-2 hover:scale-110 sm:h-16 sm:w-16"
                                    />
                                );
                            })}
                        </div>

                        {/* Bloque Derecho: Insignias de Servicio */}
                        <div className="flex shrink-0 items-center justify-center gap-5 lg:gap-6">
                            {[
                                {
                                    icon: 'local_shipping',
                                    label: 'Envíos a todo el país',
                                },
                                {
                                    icon: 'verified_user',
                                    label: 'Compra segura garantizada',
                                },
                                {
                                    icon: 'storefront',
                                    label: 'Retira o solicita tu instalación',
                                },
                            ].map((b) => (
                                <div
                                    key={b.label}
                                    className="flex flex-col items-center gap-1.5 text-center"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shadow-lg ring-2 ring-white/30 sm:h-11 sm:w-11">
                                        <span className="material-symbols-outlined text-lg sm:text-xl">
                                            {b.icon}
                                        </span>
                                    </span>
                                    <span className="max-w-[95px] text-[10px] font-bold leading-tight text-white">
                                        {b.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-8 lg:flex-row">
                    {/* Sidebar Filtros */}
                    <aside className="w-full shrink-0 lg:w-72">
                        <div className="sticky top-24 space-y-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            {/* Título de la Categoría Activa */}
                            {activeCategoryName && (
                                <div className="mb-1 border-b border-slate-100 pb-3">
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="material-symbols-outlined text-sm text-[#855300]">
                                            category
                                        </span>
                                        {catType === 'parent' || theme
                                            ? 'Categoría'
                                            : 'Sub-Categoría'}
                                    </span>
                                    <h2 className="mt-1 text-lg font-black leading-tight text-black">
                                        {activeCategoryName}
                                    </h2>
                                </div>
                            )}

                            <div className="mb-1 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-600">
                                    <span className="material-symbols-outlined text-base text-[#855300]">
                                        tune
                                    </span>
                                    Filtros
                                </h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={cleanFilters}
                                        className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            filter_alt_off
                                        </span>
                                        Limpiar
                                    </button>
                                )}
                            </div>

                            {/* Chips de Filtros Activos */}
                            {chips.length > 0 && (
                                <div className="border-b border-slate-100 py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {chips.map((chip) => (
                                            <button
                                                key={chip.key}
                                                onClick={() =>
                                                    removeFilter(chip.key)
                                                }
                                                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                            >
                                                {chip.label}
                                                <span className="material-symbols-outlined text-xs">
                                                    close
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Secciones de Filtros Dinámicas por Categoría */}
                            {sections.map((sec) => renderSection(sec))}
                        </div>
                    </aside>

                    {/* Contenido Derecho */}
                    <div className="min-w-0 flex-1">
                        {/* Barra Superior de Ordenamiento y Estado */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
                            <span className="text-sm font-bold text-slate-700">
                                {productList.length} de{' '}
                                <span className="font-extrabold text-black">
                                    {productos?.total ?? productList.length}
                                </span>{' '}
                                resultados
                            </span>
                            <div className="flex shrink-0 items-center gap-3">
                                <select
                                    value={activeSort}
                                    onChange={handleSort}
                                    className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-400"
                                >
                                    <option value="">
                                        Destacados / Relevancia
                                    </option>
                                    <option value="price_asc">
                                        Precio: menor a mayor
                                    </option>
                                    <option value="price_desc">
                                        Precio: mayor a menor
                                    </option>
                                </select>
                                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            grid_view
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black'}`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            view_list
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Grilla / Lista de Productos */}
                        {productList.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {productList.map((item) => {
                                        const old = oldPriceOf(item);
                                        const disc = discountOf(item);
                                        return (
                                            <div
                                                key={item.id}
                                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                            >
                                                <div className="relative flex aspect-square items-center justify-center overflow-hidden border-b border-slate-100 bg-white p-5">
                                                    <img
                                                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                                                        src={productImg(item)}
                                                        alt={item.nombre}
                                                    />
                                                    {disc !== null && (
                                                        <span className="absolute left-3 top-3 rounded-full bg-green-600 px-2 py-1 text-[10px] font-black text-white shadow-md">
                                                            -{disc}%
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-grow flex-col p-4">
                                                    {item.marca?.nombre && (
                                                        <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#855300]">
                                                            {item.marca.nombre}
                                                        </span>
                                                    )}
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            item.id,
                                                        )}
                                                        className="mb-3 line-clamp-2 text-sm font-bold leading-snug text-black transition-colors group-hover:text-[#855300]"
                                                    >
                                                        {item.nombre}
                                                    </Link>
                                                    <div className="mt-auto">
                                                        <div className="flex flex-wrap items-baseline gap-2">
                                                            {old !== null && (
                                                                <span className="text-xs font-semibold text-slate-400 line-through">
                                                                    S/{' '}
                                                                    {old.toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            )}
                                                            <span className="text-lg font-black text-black">
                                                                S/{' '}
                                                                {currentPrice(
                                                                    item,
                                                                ).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500">
                                                            <span className="material-symbols-outlined text-xs">
                                                                local_shipping
                                                            </span>
                                                            Envío a todo el país
                                                            · Retiro en tienda
                                                        </p>
                                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                            <span className="text-[10px] font-bold text-emerald-600">
                                                                Stock:{' '}
                                                                {formatStock(
                                                                    item.stock,
                                                                    item.unidad_medida,
                                                                )}
                                                            </span>
                                                            <Link
                                                                href={route(
                                                                    'store.detail',
                                                                    item.id,
                                                                )}
                                                                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-black px-3 py-2 text-[10px] font-bold text-white transition-all hover:bg-[#fea619] hover:text-black"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">
                                                                    visibility
                                                                </span>
                                                                Ver
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {productList.map((item) => {
                                        const old = oldPriceOf(item);
                                        const disc = discountOf(item);
                                        return (
                                            <div
                                                key={item.id}
                                                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl sm:flex-row"
                                            >
                                                <div className="flex min-h-[160px] shrink-0 items-center justify-center border-b border-slate-100 bg-white p-4 sm:w-44 sm:border-b-0 sm:border-r">
                                                    <img
                                                        className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                                                        src={productImg(item)}
                                                        alt={item.nombre}
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col justify-center gap-1 p-5">
                                                    <div className="flex items-center gap-2">
                                                        {item.marca?.nombre && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#855300]">
                                                                {
                                                                    item.marca
                                                                        .nombre
                                                                }
                                                            </span>
                                                        )}
                                                        {disc !== null && (
                                                            <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-black text-white">
                                                                -{disc}%
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            item.id,
                                                        )}
                                                        className="text-base font-bold leading-snug text-black transition-colors group-hover:text-[#855300]"
                                                    >
                                                        {item.nombre}
                                                    </Link>
                                                    <div className="mt-1 flex items-baseline gap-2">
                                                        {old !== null && (
                                                            <span className="text-xs font-semibold text-slate-400 line-through">
                                                                S/{' '}
                                                                {old.toFixed(2)}
                                                            </span>
                                                        )}
                                                        <span className="text-xl font-black text-black">
                                                            S/{' '}
                                                            {currentPrice(
                                                                item,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                                        <span className="material-symbols-outlined text-xs">
                                                            local_shipping
                                                        </span>
                                                        Envío a todo el país ·
                                                        Retiro en tienda
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-emerald-600">
                                                            Stock:{' '}
                                                            {formatStock(
                                                                item.stock,
                                                                item.unidad_medida,
                                                            )}
                                                        </span>
                                                        <Link
                                                            href={route(
                                                                'store.detail',
                                                                item.id,
                                                            )}
                                                            className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#fea619] hover:text-black"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">
                                                                visibility
                                                            </span>
                                                            Ver Producto
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        ) : (
                            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                                <span className="material-symbols-outlined mb-3 block text-5xl text-slate-300">
                                    search_off
                                </span>
                                <p className="font-bold text-slate-500">
                                    {hasActiveFilters
                                        ? 'No se encontraron productos con los filtros seleccionados.'
                                        : 'No se encontraron productos registrados en el POS.'}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={cleanFilters}
                                        className="mt-4 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#fea619] hover:text-black"
                                    >
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        )}

                        {productos && productos.last_page > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-4">
                                <button
                                    onClick={() =>
                                        goToPage(
                                            Number(productos.current_page) - 1,
                                        )
                                    }
                                    disabled={!productos.prev_page_url}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Anterior
                                </button>
                                <span className="text-xs font-bold text-slate-600">
                                    Página {productos.current_page} de{' '}
                                    {productos.last_page}
                                </span>
                                <button
                                    onClick={() =>
                                        goToPage(
                                            Number(productos.current_page) + 1,
                                        )
                                    }
                                    disabled={!productos.next_page_url}
                                    className="rounded-xl border border-black bg-black px-4 py-2.5 text-xs font-bold text-white transition-all hover:border-[#fea619] hover:bg-[#fea619] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <StoreFooter />

            {whatsappCheckout && whatsappPhone && (
                <WhatsAppButton
                    variant="floating"
                    phone={whatsappPhone}
                    product={{
                        nombre: 'Consulta de la tienda',
                        sku: '',
                        precio: 0,
                        unidad: '',
                    }}
                />
            )}
        </div>
    );
}
