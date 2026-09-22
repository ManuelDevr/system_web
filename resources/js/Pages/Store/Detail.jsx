import WhatsAppButton from '@/Components/Store/WhatsAppButton';
import StoreFooter from '@/Components/StoreFooter';
import StoreHeader from '@/Components/StoreHeader';
import { formatFactor, formatStock } from '@/Utils/format';
import { getYouTubeId } from '@/Utils/video';
import { Head, Link, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function StoreDetail({ producto, similares, categorias }) {
    const { webConfig = {} } = usePage().props;
    const whatsappPhone = webConfig.whatsapp_phone;
    const [activeTab, setActiveTab] = useState('details');

    const conversiones = (producto?.conversiones || []).filter(
        (c) =>
            c &&
            (c.estado === 'Activo' ||
                c.estado === undefined ||
                c.estado === null),
    );
    const hasConversions = conversiones.length > 0;
    const [selectedConvId, setSelectedConvId] = useState(null);
    const selectedConv =
        conversiones.find((c) => c.id === selectedConvId) || null;

    const basePrice = parseFloat(producto?.precio_venta || 0);
    const baseDiscountPct = parseFloat(producto?.tasa_descuento || 0);
    const hasBaseDiscount =
        baseDiscountPct > 0 && baseDiscountPct < 100 && basePrice > 0;
    const baseOldPrice = hasBaseDiscount
        ? basePrice / (1 - baseDiscountPct / 100)
        : null;

    const convPrice = selectedConv
        ? parseFloat(selectedConv.precio_venta || 0)
        : 0;
    const convDiscountPct = selectedConv
        ? parseFloat(selectedConv.tasa_descuento || 0)
        : 0;
    const hasConvDiscount =
        convDiscountPct > 0 && convDiscountPct < 100 && convPrice > 0;
    const convCurrentPrice = hasConvDiscount
        ? convPrice * (1 - convDiscountPct / 100)
        : convPrice;
    const convOldPrice = hasConvDiscount ? convPrice : null;

    const fmtPrice = (v, decimals = 2) =>
        `S/ ${parseFloat(v || 0).toFixed(decimals || 2)}`;

    const [activeMedia, setActiveMedia] = useState(0);
    const [favorited, setFavorited] = useState(false);
    const [copied, setCopied] = useState(false);
    const thumbsRef = useRef(null);

    const resolveImg = (url) => {
        if (!url) return url;
        return url.startsWith('http://') || url.startsWith('https://')
            ? url
            : `/storage/${url}`;
    };

    const imgUrl =
        resolveImg(producto?.imagen_url) ||
        'https://via.placeholder.com/500?text=Sin+Imagen';

    const rawImagenes = producto?.imagenes?.length
        ? producto.imagenes.filter(Boolean)
        : producto?.imagen_url
          ? [producto.imagen_url]
          : [];
    const showVideo = producto?.mostrar_video !== false;
    const youtubeVideoId = showVideo ? getYouTubeId(producto?.video_url) : null;

    const galleryMedia = rawImagenes.map((url) => ({
        type: 'image',
        url: resolveImg(url),
    }));
    if (galleryMedia.length === 0)
        galleryMedia.push({ type: 'image', url: imgUrl });
    if (youtubeVideoId) galleryMedia.push({ type: 'video' });
    const activeSlide = galleryMedia[activeMedia];

    const goMedia = (dir) =>
        setActiveMedia(
            (i) => (i + dir + galleryMedia.length) % galleryMedia.length,
        );
    const scrollThumbs = (dir) => {
        if (thumbsRef.current)
            thumbsRef.current.scrollBy({ top: dir * 120, behavior: 'smooth' });
    };

    const handleShare = async () => {
        const url = window.location.href;
        const title = producto?.nombre || 'Producto CMA Store';
        const text = `${title} - S/ ${parseFloat(producto?.precio_venta || 0).toFixed(2)} | CMA Store`;
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch (e) {
                /* cancelado */
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            /* sin soporte */
        }
    };

    const cat = producto?.categoria;
    const topCat = cat?.parent ?? null;
    const subCat = cat && cat.parent ? cat : null;

    const relatedCarouselRef = useRef(null);
    const scrollSlider = (ref, dir) => {
        if (ref.current)
            ref.current.scrollBy({
                left: dir * (ref.current.clientWidth * 0.8),
                behavior: 'smooth',
            });
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#fea619]/30">
            <Head title={`${producto?.nombre || 'Producto'} | CMA Store`}>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <StoreHeader categorias={categorias} />

            <main className="mx-auto w-full max-w-[1280px] flex-grow px-6 py-8">
                {/* Breadcrumb: Categoría / Subcategoría / Producto */}
                <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-400">
                    <Link
                        href={route('store.index')}
                        className="transition-colors hover:text-black"
                    >
                        Inicio
                    </Link>
                    <span className="select-none text-slate-300">/</span>
                    <Link
                        href={route('store.catalog')}
                        className="transition-colors hover:text-black"
                    >
                        Productos
                    </Link>
                    <span className="select-none text-slate-300">/</span>
                    {topCat && (
                        <>
                            <Link
                                href={route('store.catalog', {
                                    category: topCat.id,
                                })}
                                className="max-w-[200px] truncate transition-colors hover:text-black"
                            >
                                {topCat.nombre}
                            </Link>
                            <span className="select-none text-slate-300">
                                /
                            </span>
                        </>
                    )}
                    {subCat && (
                        <>
                            <Link
                                href={route('store.catalog', {
                                    category: subCat.id,
                                })}
                                className="max-w-[200px] truncate transition-colors hover:text-black"
                            >
                                {subCat.nombre}
                            </Link>
                            <span className="select-none text-slate-300">
                                /
                            </span>
                        </>
                    )}
                    {cat && !cat.parent && (
                        <>
                            <Link
                                href={route('store.catalog', {
                                    category: cat.id,
                                })}
                                className="max-w-[200px] truncate transition-colors hover:text-black"
                            >
                                {cat.nombre}
                            </Link>
                            <span className="select-none text-slate-300">
                                /
                            </span>
                        </>
                    )}
                    <span className="font-black text-black underline decoration-[#fea619] decoration-2 underline-offset-4">
                        {producto?.nombre || 'Detalle'}
                    </span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Galería de Producto: Miniaturas + Visor Principal */}
                    <div className="lg:col-span-7">
                        <div className="flex gap-4">
                            {/* Columna Izquierda: Miniaturas Verticales */}
                            <div className="flex w-20 shrink-0 flex-col items-center sm:w-24">
                                <button
                                    onClick={() => scrollThumbs(-1)}
                                    className="mb-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-[#fea619]/40 hover:bg-[#fea619]/10"
                                    aria-label="Ver miniaturas anteriores"
                                >
                                    <span className="material-symbols-outlined text-base text-slate-500">
                                        expand_less
                                    </span>
                                </button>

                                <div
                                    ref={thumbsRef}
                                    className="no-scrollbar flex max-h-[380px] flex-col gap-3 overflow-y-auto pr-0.5"
                                >
                                    {galleryMedia.map((m, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveMedia(idx)}
                                            className={`group/thumb relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border bg-white transition-all ${
                                                activeMedia === idx
                                                    ? 'border-[2.5px] border-black shadow-md'
                                                    : 'border border-slate-200 hover:border-slate-400'
                                            }`}
                                        >
                                            {m.type === 'video' ? (
                                                <span className="absolute inset-0 flex items-center justify-center bg-black">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/15 transition-colors group-hover/thumb:border-[#fea619] group-hover/thumb:bg-[#fea619]">
                                                        <span className="material-symbols-outlined text-lg text-white group-hover/thumb:text-black">
                                                            play_arrow
                                                        </span>
                                                    </span>
                                                </span>
                                            ) : (
                                                <img
                                                    src={m.url}
                                                    alt={`${producto?.nombre || 'Producto'} ${idx + 1}`}
                                                    className="h-full w-full object-contain"
                                                />
                                            )}
                                            {activeMedia === idx && (
                                                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-[#fea619]"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => scrollThumbs(1)}
                                    className="mt-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:border-[#fea619]/40 hover:bg-[#fea619]/10"
                                    aria-label="Ver más miniaturas"
                                >
                                    <span className="material-symbols-outlined text-base text-slate-500">
                                        expand_more
                                    </span>
                                </button>
                            </div>

                            {/* Columna Derecha: Visor Principal */}
                            <div className="relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {activeSlide.type === 'video' ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                                        <iframe
                                            className="absolute inset-0 h-full w-full"
                                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                            title={`Video - ${producto?.nombre || 'Producto'}`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <img
                                        key={activeMedia}
                                        src={activeSlide.url}
                                        className="animate-in fade-in max-h-[400px] object-contain transition-transform duration-300 duration-500 hover:scale-105"
                                        alt={producto?.nombre}
                                    />
                                )}

                                {/* Botones flotantes: Corazón y Compartir */}
                                <div className="absolute right-4 top-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setFavorited(!favorited)}
                                        aria-label="Agregar a favoritos"
                                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white shadow-md transition-all hover:scale-110 active:scale-95 ${
                                            favorited
                                                ? 'border-[#fea619] text-[#ef4444]'
                                                : 'border-slate-200 text-slate-400 hover:text-[#ef4444]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {favorited
                                                ? 'favorite'
                                                : 'favorite_border'}
                                        </span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        aria-label="Compartir producto"
                                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-white shadow-md transition-all hover:scale-110 active:scale-95 ${
                                            copied
                                                ? 'border-emerald-400 text-emerald-600'
                                                : 'border-slate-200 text-slate-400 hover:text-[#855300]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {copied ? 'check' : 'share'}
                                        </span>
                                    </button>
                                </div>

                                {galleryMedia.length > 1 && (
                                    <>
                                        {/* Flecha derecha: avanzar */}
                                        <button
                                            onClick={() => goMedia(1)}
                                            aria-label="Siguiente foto"
                                            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:border-[#fea619] hover:bg-[#fea619] active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-xl font-bold text-black">
                                                chevron_right
                                            </span>
                                        </button>
                                        {/* Flecha izquierda: retroceder */}
                                        <button
                                            onClick={() => goMedia(-1)}
                                            aria-label="Foto anterior"
                                            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:border-[#fea619] hover:bg-[#fea619] active:scale-95"
                                        >
                                            <span className="material-symbols-outlined text-xl font-bold text-black">
                                                chevron_left
                                            </span>
                                        </button>
                                    </>
                                )}

                                {/* Indicador de posición (dots) */}
                                {galleryMedia.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-md backdrop-blur-sm">
                                        {galleryMedia.map((m, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setActiveMedia(idx)
                                                }
                                                aria-label={`Ver foto ${idx + 1}`}
                                                className={`h-2 cursor-pointer rounded-full transition-all ${
                                                    activeMedia === idx
                                                        ? 'w-6 bg-[#fea619]'
                                                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                                                }`}
                                            ></button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Información Producto */}
                    <div className="flex flex-col gap-6 lg:col-span-5">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                {producto?.categoria?.nombre && (
                                    <span className="rounded bg-[#fea619] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-black">
                                        {producto.categoria.nombre}
                                    </span>
                                )}
                                {producto?.marca?.nombre && (
                                    <span className="rounded bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                        {producto.marca.nombre}
                                    </span>
                                )}
                            </div>
                            <h1 className="mb-2 text-2xl font-black text-black sm:text-3xl">
                                {producto?.nombre}
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-500">
                                SKU:{' '}
                                <span className="font-bold text-black">
                                    {producto?.sku || 'N/A'}
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="text-3xl font-black text-black">
                                {selectedConv
                                    ? fmtPrice(convCurrentPrice)
                                    : fmtPrice(basePrice)}
                            </span>
                            {selectedConv
                                ? hasConvDiscount &&
                                  convOldPrice > convCurrentPrice && (
                                      <span className="text-xs text-slate-400 line-through">
                                          {fmtPrice(convOldPrice)}
                                      </span>
                                  )
                                : hasBaseDiscount &&
                                  baseOldPrice > basePrice && (
                                      <span className="text-xs text-slate-400 line-through">
                                          {fmtPrice(baseOldPrice)}
                                      </span>
                                  )}
                            {(selectedConv
                                ? hasConvDiscount
                                : hasBaseDiscount) && (
                                <span className="rounded-full bg-green-600 px-2 py-1 text-[10px] font-black text-white shadow-md">
                                    -
                                    {selectedConv
                                        ? Math.round(convDiscountPct)
                                        : Math.round(baseDiscountPct)}
                                    %
                                </span>
                            )}
                        </div>

                        {/* Selector de Unidades de Medida */}
                        {hasConversions && (
                            <div>
                                <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                    Presentación / Unidad de Venta
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedConvId(null)}
                                        className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-bold transition-all ${
                                            !selectedConv
                                                ? 'border-black bg-black text-white shadow-md'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                                        }`}
                                    >
                                        {producto?.unidad_medida || 'Unidad'}
                                        <span
                                            className={`mt-0.5 block text-[10px] font-semibold ${!selectedConv ? 'text-orange-300' : 'text-slate-400'}`}
                                        >
                                            {selectedConv
                                                ? ''
                                                : `S/ ${parseFloat(producto?.precio_venta || 0).toFixed(2)}`}
                                        </span>
                                    </button>
                                    {conversiones.map((conv) => {
                                        const convDisc = parseFloat(
                                            conv.tasa_descuento || 0,
                                        );
                                        const hasConvDisc =
                                            convDisc > 0 && convDisc < 100;
                                        const convPriceNow = hasConvDisc
                                            ? parseFloat(
                                                  conv.precio_venta || 0,
                                              ) *
                                              (1 - convDisc / 100)
                                            : parseFloat(
                                                  conv.precio_venta || 0,
                                              );
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() =>
                                                    setSelectedConvId(conv.id)
                                                }
                                                className={`cursor-pointer rounded-xl border px-4 py-2.5 text-left transition-all ${
                                                    selectedConvId === conv.id
                                                        ? 'border-black bg-black text-white shadow-md'
                                                        : 'bg-white hover:border-slate-400'
                                                }`}
                                            >
                                                <span
                                                    className={`flex items-center gap-1.5 text-sm font-bold ${selectedConvId === conv.id ? 'text-white' : 'text-slate-700'}`}
                                                >
                                                    {conv.unidad?.nombre ||
                                                        conv.unidad_medida ||
                                                        'Presentación'}
                                                    {hasConvDisc && (
                                                        <span
                                                            className={`rounded px-1.5 py-0.5 text-[9px] font-black ${selectedConvId === conv.id ? 'bg-orange-400 text-black' : 'bg-green-600 text-white'}`}
                                                        >
                                                            -
                                                            {Math.round(
                                                                convDisc,
                                                            )}
                                                            %
                                                        </span>
                                                    )}
                                                </span>
                                                <span
                                                    className={`mt-0.5 block text-[10px] font-semibold ${selectedConvId === conv.id ? 'text-orange-300' : 'text-slate-400'}`}
                                                >
                                                    {conv.factor > 1
                                                        ? `${formatFactor(conv.factor)} unidades`
                                                        : ''}{' '}
                                                    · S/{' '}
                                                    {convPriceNow.toFixed(2)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedConv && selectedConv.factor > 1 && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Esta presentación equivale a{' '}
                                        <span className="font-bold text-black">
                                            {formatFactor(selectedConv.factor)}
                                        </span>{' '}
                                        unidades de{' '}
                                        <span className="font-bold text-black">
                                            {producto?.unidad_medida ||
                                                'unidad'}
                                        </span>
                                        .
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Especificaciones Rápidas */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                                <p className="font-bold uppercase text-slate-400">
                                    Stock Disponible
                                </p>
                                <p className="mt-0.5 font-black text-black">
                                    {formatStock(
                                        producto?.stock,
                                        producto?.unidad_medida,
                                    )}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3">
                                <p className="font-bold uppercase text-slate-400">
                                    Unidad Base
                                </p>
                                <p className="mt-0.5 font-black text-black">
                                    {producto?.unidad_medida || 'UN'}
                                </p>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-3">
                            {whatsappPhone ? (
                                <WhatsAppButton
                                    variant="primary"
                                    className="flex-1 text-xs uppercase tracking-wider"
                                    phone={whatsappPhone}
                                    product={{
                                        nombre: producto?.nombre,
                                        sku: producto?.sku,
                                        precio: selectedConv
                                            ? convCurrentPrice
                                            : basePrice,
                                        unidad:
                                            selectedConv?.unidad?.nombre ||
                                            producto?.unidad_medida ||
                                            'UND',
                                    }}
                                />
                            ) : (
                                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    WhatsApp de la tienda no configurado
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs de Detalle */}
                <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex gap-6 border-b border-slate-100 pb-3">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`cursor-pointer border-b-2 pb-2 text-sm font-bold transition-all ${activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-black'}`}
                        >
                            Detalles del Producto
                        </button>
                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`cursor-pointer border-b-2 pb-2 text-sm font-bold transition-all ${activeTab === 'specs' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-black'}`}
                        >
                            Especificaciones Técnicas
                        </button>
                    </div>

                    {activeTab === 'details' ? (
                        <div className="animate-in fade-in space-y-3 text-sm leading-relaxed text-slate-600 duration-300">
                            <p>
                                {producto?.nombre} es un producto garantizado
                                para ferretería e instalaciones de alta calidad.
                            </p>
                            <p>
                                Categoría:{' '}
                                <span className="font-bold text-black">
                                    {producto?.categoria?.nombre || 'General'}
                                </span>{' '}
                                | Marca:{' '}
                                <span className="font-bold text-black">
                                    {producto?.marca?.nombre || 'Sin Marca'}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in space-y-2 text-xs duration-300">
                            <div className="flex justify-between border-b border-slate-100 py-2">
                                <span className="text-slate-500">SKU</span>
                                <span className="font-bold text-black">
                                    {producto?.sku || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 py-2">
                                <span className="text-slate-500">
                                    Unidad de Medida
                                </span>
                                <span className="font-bold text-black">
                                    {producto?.unidad_medida || 'UN'}
                                </span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Video del Producto */}
                {showVideo && (
                    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#fea619]/30 bg-[#fea619]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#855300]">
                                <span className="material-symbols-outlined text-sm">
                                    play_circle
                                </span>
                                Video
                            </span>
                            <h2 className="text-lg font-black text-black sm:text-xl">
                                Video del Producto
                            </h2>
                        </div>

                        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-black">
                            {youtubeVideoId ? (
                                <iframe
                                    className="absolute inset-0 h-full w-full"
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                    title={`Video - ${producto?.nombre || 'Producto'}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="px-6 py-16 text-center">
                                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-4xl text-white/80">
                                            play_arrow
                                        </span>
                                    </div>
                                    <p className="mt-5 text-lg font-black text-white">
                                        Video Disponible Próximamente
                                    </p>
                                    <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
                                        Estamos preparando un video explicativo
                                        para este producto. Vuelve pronto para
                                        verlo en acción.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Productos Relacionados */}
                {similares.length > 0 && (
                    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#fea619]/30 bg-[#fea619]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#855300]">
                                    <span className="material-symbols-outlined text-sm">
                                        auto_awesome
                                    </span>
                                    Productos Relacionados
                                </span>
                                <h2 className="mt-2.5 text-lg font-black text-black sm:text-xl">
                                    Los clientes también vieron
                                </h2>
                            </div>
                            <Link
                                href={route('store.catalog', {
                                    category: producto?.categoria_id,
                                })}
                                className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#ef4444] transition-all hover:gap-2.5 hover:underline"
                            >
                                Ver más{' '}
                                <span className="material-symbols-outlined text-base">
                                    chevron_right
                                </span>
                            </Link>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() =>
                                    scrollSlider(relatedCarouselRef, -1)
                                }
                                className="absolute -left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl font-bold text-black">
                                    chevron_left
                                </span>
                            </button>

                            <div
                                ref={relatedCarouselRef}
                                className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                            >
                                {similares.map((item) => {
                                    const imgUrl = item.imagen_url
                                        ? item.imagen_url.startsWith(
                                              'http://',
                                          ) ||
                                          item.imagen_url.startsWith('https://')
                                            ? item.imagen_url
                                            : `/storage/${item.imagen_url}`
                                        : 'https://via.placeholder.com/300?text=Sin+Imagen';

                                    return (
                                        <div
                                            key={item.id}
                                            className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f9fb] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[300px]"
                                        >
                                            <div className="relative flex h-64 items-center justify-center overflow-hidden bg-white p-6">
                                                <img
                                                    className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                                    src={imgUrl}
                                                    alt={item.nombre}
                                                />
                                                <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                                    {item.marca?.nombre ||
                                                        'CMA'}
                                                </span>
                                            </div>
                                            <div className="flex flex-grow flex-col p-5">
                                                <span className="mb-1 text-xs font-bold text-[#855300]">
                                                    SKU: {item.sku || 'N/A'}
                                                </span>
                                                <h4 className="mb-2 line-clamp-2 text-base font-bold text-black transition-colors group-hover:text-[#855300]">
                                                    {item.nombre}
                                                </h4>
                                                <p className="mb-4 text-xs text-slate-500">
                                                    Stock disponible:{' '}
                                                    <span className="font-bold text-green-600">
                                                        Disponibles
                                                    </span>
                                                </p>
                                                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                                                    <span className="text-xl font-black text-black">
                                                        S/{' '}
                                                        {parseFloat(
                                                            item.precio_venta ||
                                                                0,
                                                        ).toFixed(2)}
                                                    </span>
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            item.id,
                                                        )}
                                                        className="rounded-xl bg-black p-2.5 text-white transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">
                                                            visibility
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() =>
                                    scrollSlider(relatedCarouselRef, 1)
                                }
                                className="absolute -right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                            >
                                <span className="material-symbols-outlined text-xl font-bold text-black">
                                    chevron_right
                                </span>
                            </button>
                        </div>
                    </section>
                )}
            </main>

            <StoreFooter />
        </div>
    );
}
