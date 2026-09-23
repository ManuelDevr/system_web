import banner1 from '@/Assets/Banner/banner1.webp';
import gyplacLogo from '@/Assets/Marcas/Gyplac.webp';
import pretulLogo from '@/Assets/Marcas/pretul-logo.webp';
import soportexLogo from '@/Assets/Marcas/soportex_innova_logo.webp';
import stanleyLogo from '@/Assets/Marcas/stanley-logo.webp';
import strutekLogo from '@/Assets/Marcas/Strutek-logo.webp';
import truperLogo from '@/Assets/Marcas/Truper-logo.webp';
import StoreFooter from '@/Components/StoreFooter';
import StoreHeader from '@/Components/StoreHeader';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FaPhone, FaWhatsapp } from 'react-icons/fa';

export default function StoreIndex({
    categorias,
    productos,
    racksCategoria = null,
    racksProductos = [],
    construccionCategoria = null,
    construccionProductos = [],
}) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showHelpWidget, setShowHelpWidget] = useState(true);
    const rackCarouselRef = useRef(null);
    const categoriesCarouselRef = useRef(null);
    const featuredCarouselRef = useRef(null);
    const ferreteriaCarouselRef = useRef(null);
    const heroTouchX = useRef(null);
    const heroTouchY = useRef(null);

    const scrollSlider = (ref, dir) => {
        const el = ref.current;
        if (!el) return;
        const step = Math.round(el.clientWidth * 0.85);
        el.scrollBy({ left: dir * step, behavior: 'smooth' });
    };

    const productList = productos || [];

    const mainCategories = categorias || [];

    const racksProducts = racksProductos || [];
    const racksTitle = racksCategoria?.nombre || 'Racks y Soportes para TV';
    const racksCategoryId = racksCategoria?.id || null;

    const construccionProducts = construccionProductos || [];
    const construccionTitle =
        construccionCategoria?.nombre || 'Ferretería y Herramientas';
    const construccionCategoryId = construccionCategoria?.id || null;

    const categoryIcons = [
        'handyman',
        'power',
        'plumbing',
        'electrical_services',
        'construction',
        'hardware',
        'build',
        'engineering',
        'grid_view',
        'settings_brick_home',
    ];

    const slides = [
        {
            image: banner1,
            tag: 'Servicios de Instalación Elite',
            title: 'Hardware de Precisión y Montaje Profesional de TV',
            desc: 'Desde herramientas estructurales de uso rudo hasta sistemas de racks profesionales, proporcionamos los componentes industriales y la instalación experta que su proyecto exige.',
        },
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgEAMQoSvf7kM2gmjoSyFpUSuC_0b0C2KmGC9_9riq4gBbXlFKApkSw0KXeTytWgKoTnoRCAln1cA77vqTHljvRxAnnu2Df62oLYCqfBBEqApdI-IeVAjHVled9857LOiCunwWkPXaPIOdDP9GNhsbcmPgmfp8aelF3vli4D2Jn5Y2ZM9BioSSe0YMvh8U9qPBttAm8cR5StWmMC_KMRudsot3GaTWOVr3fAM_9ZnFI9Sl1-qPfiBrvn5JOae6kFRMMGoOe1khZzM',
            tag: 'Herramientas de Alto Rendimiento',
            title: 'Equipamiento Profesional para Contratistas',
            desc: 'Herramientas eléctricas e inalámbricas con tecnología de punta diseñadas para resistir los entornos de trabajo más exigentes.',
        },
        {
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD-pfHKzTiL1tDakaBTagwr1NYxITB1nz9CzjvqvihjeJeyOtYP2oit7-BDlDUxnT25D0U8LauIvAij29c_IELwKWefpN6NQtVPIkw1jmviomkwFy8YQMPMdXl6jOazJmgeBGXBSo7cCaHCWNYO2Iuzfq-R8B46VLZDR6hel9cO2CergmN17vTsBFe9k0wrk9H8sufm28Zl7eBPDydz7Qt-rYpO2ytXUbrfdDZZQcJTPWQ_KIvOFXVVB6siBdUKxE9jl6_NloaI1Y',
            tag: 'Sistemas Industriales',
            title: 'Soportes de Nivel e Infraestructura Compleja',
            desc: 'Nivelación láser y estructuras avanzadas para instalaciones de video wall y despliegues comerciales en todo el país.',
        },
    ];

    const brands = [
        { id: 'gyplac', name: 'Gyplac', logo: gyplacLogo },
        { id: 'pretul', name: 'Pretul', logo: pretulLogo },
        { id: 'soportex-innova', name: 'Soportex Innova', logo: soportexLogo },
        { id: 'stanley', name: 'Stanley', logo: stanleyLogo },
        { id: 'strutek', name: 'Strutek', logo: strutekLogo },
        { id: 'truper', name: 'Truper', logo: truperLogo },
    ];

    const goSlide = (dir) =>
        setCurrentSlide((prev) => (prev + dir + slides.length) % slides.length);

    const onHeroTouchStart = (e) => {
        heroTouchX.current = e.touches[0].clientX;
        heroTouchY.current = e.touches[0].clientY;
    };

    const onHeroTouchEnd = (e) => {
        if (heroTouchX.current === null) return;
        const dx = e.changedTouches[0].clientX - heroTouchX.current;
        const dy = e.changedTouches[0].clientY - heroTouchY.current;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            goSlide(dx < 0 ? 1 : -1);
        }
        heroTouchX.current = null;
        heroTouchY.current = null;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#fea619]/30">
            <Head title="CMA Store">
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
                <style>{`
          @keyframes infiniteScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-infinite-scroll {
            display: flex;
            width: max-content;
            animation: infiniteScroll 25s linear infinite;
          }
          .animate-infinite-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
            </Head>

            <StoreHeader categorias={categorias} />
            <main className="relative">
                {/* Carrusel Hero */}
                <section
                    className="relative flex min-h-[440px] items-center overflow-hidden bg-black select-none md:min-h-[560px] lg:min-h-[680px]"
                    onTouchStart={onHeroTouchStart}
                    onTouchEnd={onHeroTouchEnd}
                >
                    {slides.map((slide, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'z-10 scale-100 opacity-100' : 'z-0 scale-105 opacity-0'}`}
                        >
                            <div
                                className="duration-10000 absolute inset-0 scale-105 bg-cover bg-center transition-transform ease-out hover:scale-100"
                                style={{
                                    backgroundImage: `url('${slide.image}')`,
                                }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30 md:via-black/60"></div>
                        </div>
                    ))}

                    <div className="relative z-20 mx-auto w-full max-w-[1280px] px-5 py-10 md:px-6 md:py-16">
                        <div className="max-w-2xl text-white">
                            <div className="mb-5 inline-flex animate-bounce items-center gap-2 rounded bg-[#fea619] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-lg sm:px-4 sm:py-1.5 sm:text-xs">
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[14px]">
                                    verified
                                </span>
                                {slides[currentSlide].tag}
                            </div>
                            <h1 className="mb-4 text-[26px] font-black leading-[1.1] text-white drop-shadow-md transition-all duration-700 sm:text-3xl md:text-5xl">
                                {slides[currentSlide].title}
                            </h1>
                            <p className="mb-7 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
                                {slides[currentSlide].desc}
                            </p>
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                <Link
                                    href={route('store.catalog')}
                                    className="h-13 flex items-center gap-2 rounded-xl bg-[#fea619] px-8 text-sm font-extrabold text-black shadow-xl shadow-[#fea619]/20 transition-all hover:scale-105 hover:bg-[#ffb95f] active:scale-95"
                                >
                                    Explorar Catálogo{' '}
                                    <span translate="no" aria-hidden="true" className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                                        bolt
                                    </span>
                                </Link>
                                {productList.length > 0 && (
                                    <Link
                                        href={route(
                                            'store.detail',
                                            productList[0].id,
                                        )}
                                        className="h-13 flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 text-sm font-extrabold text-white backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
                                    >
                                        Ver Producto Destacado
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flechas de Carrusel */}
                    <button
                        type="button"
                        aria-label="Anterior"
                        onClick={() => goSlide(-1)}
                        className="absolute left-2 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/70 active:scale-95 md:flex"
                    >
                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                            chevron_left
                        </span>
                    </button>
                    <button
                        type="button"
                        aria-label="Siguiente"
                        onClick={() => goSlide(1)}
                        className="absolute right-2 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/70 active:scale-95 md:flex"
                    >
                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                            chevron_right
                        </span>
                    </button>

                    {/* Indicadores de Carrusel */}
                    <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 gap-2.5 md:bottom-8 md:gap-3">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-2 cursor-pointer rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-[#fea619]' : 'w-3 bg-white/40 hover:bg-white/70'}`}
                            />
                        ))}
                    </div>
                </section>

                {/* SLIDER INFINITE LOOP de Marcas y Logos */}
                <section className="overflow-hidden border-y border-slate-200 bg-white py-7 shadow-inner">
                    <div className="animate-infinite-scroll flex select-none items-center gap-16">
                        {[...brands, ...brands].map((brand, i) => (
                            <span
                                key={i}
                                className="flex cursor-pointer items-center px-4 transition-all duration-300 hover:scale-110"
                            >
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    title={brand.name}
                                    className="h-10 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 sm:h-12"
                                />
                            </span>
                        ))}
                    </div>
                </section>

                {/* Categorías Técnicas */}
                <section className="mx-auto max-w-[1280px] px-6 py-20">
                    <div className="mb-12 flex flex-col items-baseline justify-between gap-4 md:flex-row">
                        <div>
                            <h2 className="mb-2 text-3xl font-extrabold text-black">
                                Categorías Técnicas
                            </h2>
                            <p className="max-w-xl text-slate-500">
                                Inventario de grado profesional seleccionado por
                                su integridad estructural y precisión técnica.
                            </p>
                        </div>
                        <Link
                            href={route('store.catalog')}
                            className="flex items-center gap-1 text-sm font-bold text-[#855300] transition-transform hover:translate-x-2"
                        >
                            Ver Catálogo Completo{' '}
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[18px]">
                                arrow_forward
                            </span>
                        </Link>
                    </div>

                    <div className="relative">
                        {/* Flecha izquierda */}
                        <button
                            onClick={() =>
                                scrollSlider(categoriesCarouselRef, -1)
                            }
                            className="absolute -left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_left
                            </span>
                        </button>

                        <div
                            ref={categoriesCarouselRef}
                            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                        >
                            {mainCategories.length > 0 ? (
                                mainCategories.map((cat, idx) => (
                                    <Link
                                        key={cat.id}
                                        href={route('store.catalog', {
                                            category: cat.id,
                                        })}
                                        className="group relative flex h-56 w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-[#0f172a] p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#fea619]/60 hover:shadow-2xl sm:w-[300px]"
                                    >
                                        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#fea619]/10 transition-all duration-700 group-hover:scale-150 group-hover:bg-[#fea619]/25"></div>

                                        <div className="relative flex items-start justify-between">
                                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-4xl text-[#fea619] transition-transform group-hover:rotate-6 group-hover:scale-110">
                                                {
                                                    categoryIcons[
                                                        idx %
                                                            categoryIcons.length
                                                    ]
                                                }
                                            </span>
                                            {cat.children &&
                                                cat.children.length > 0 && (
                                                    <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-bold text-white">
                                                        {cat.children.length}{' '}
                                                        sub
                                                    </span>
                                                )}
                                        </div>

                                        <div className="relative">
                                            <h3 className="text-lg font-black uppercase tracking-wide text-white transition-colors group-hover:text-[#fea619]">
                                                {cat.nombre}
                                            </h3>
                                            <span className="mt-1 flex items-center gap-1 text-xs font-bold text-[#fea619] transition-all group-hover:gap-2">
                                                Explorar{' '}
                                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                                    chevron_right
                                                </span>
                                            </span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="w-full rounded-2xl border border-slate-200 bg-white py-10 text-center">
                                    <p className="font-bold text-slate-500">
                                        No hay categorías registradas.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Flecha derecha */}
                        <button
                            onClick={() =>
                                scrollSlider(categoriesCarouselRef, 1)
                            }
                            className="absolute -right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </section>

                {/* Banner Promocional Racks y Soportes TV */}
                <section className="relative overflow-hidden bg-[#f7f9fb] py-4 lg:py-6">
                    {/* Imágenes de fondo a los lados */}
                    <img
                        src={banner1}
                        alt=""
                        className="absolute inset-y-0 left-0 w-1/2 object-cover opacity-20"
                    />
                    <img
                        src={banner1}
                        alt=""
                        className="absolute inset-y-0 right-0 w-1/2 -scale-x-100 object-cover opacity-20"
                    />

                    {/* Contenedor trapezoidal gris claro */}
                    <div className="relative mx-auto max-w-[1280px] px-6">
                        <div className="mx-auto max-w-3xl bg-[#eef1f4] px-6 py-8 text-center shadow-lg [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)] sm:px-16">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#855300] shadow-sm">
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                    tv
                                </span>
                                Solo Racks
                            </span>
                            <h2 className="mt-2 text-xl font-black uppercase leading-tight text-slate-900 sm:text-3xl">
                                {racksTitle}
                            </h2>
                            <div className="mx-auto mt-3 h-[3px] w-12 rounded-full bg-[#fea619]"></div>
                            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                                Te brindan una experiencia de entretenimiento
                                increíble, manteniendo tu televisor seguro y
                                organizado.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección de Productos Racks y Soportes */}
                <section className="mx-auto max-w-[1280px] px-6 py-14">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            {racksTitle}
                        </h2>
                        <Link
                            href={route(
                                'store.catalog',
                                racksCategoryId
                                    ? { category: racksCategoryId }
                                    : {},
                            )}
                            className="flex items-center gap-1.5 text-sm font-bold text-[#ef4444] transition-all hover:gap-2.5 hover:underline"
                        >
                            Ver todos los productos{' '}
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">
                                chevron_right
                            </span>
                        </Link>
                    </div>

                    {/* Carrusel horizontal con flechas */}
                    <div className="relative">
                        {/* Flecha izquierda */}
                        <button
                            onClick={() => scrollSlider(rackCarouselRef, -1)}
                            className="absolute -left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold">
                                chevron_left
                            </span>
                        </button>

                        <div
                            ref={rackCarouselRef}
                            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                        >
                            {racksProducts.length > 0 ? (
                                racksProducts.map((p) => {
                                    const imgUrl = p.imagen_url
                                        ? p.imagen_url.startsWith('http://') ||
                                          p.imagen_url.startsWith('https://')
                                            ? p.imagen_url
                                            : `/storage/${p.imagen_url}`
                                        : 'https://via.placeholder.com/300?text=Sin+Imagen';

                                    return (
                                        <div
                                            key={p.id}
                                            className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f9fb] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[300px]"
                                        >
                                            <div className="relative flex h-64 items-center justify-center overflow-hidden bg-white p-6">
                                                <img
                                                    className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                                    src={imgUrl}
                                                    alt={p.nombre}
                                                />
                                                <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                                    {p.marca?.nombre ||
                                                        p.categoria?.nombre ||
                                                        'CMA'}
                                                </span>
                                            </div>
                                            <div className="flex flex-grow flex-col p-5">
                                                <span className="mb-1 text-xs font-bold text-[#855300]">
                                                    {p.marca?.nombre
                                                        ? `${p.marca.nombre} · `
                                                        : ''}
                                                    SKU: {p.sku || 'N/A'}
                                                </span>
                                                <h4 className="mb-2 line-clamp-2 text-base font-bold text-black transition-colors group-hover:text-[#855300]">
                                                    {p.nombre}
                                                </h4>
                                                <p className="mb-4 text-xs text-slate-500">
                                                    Stock disponible:{' '}
                                                    <span className="font-bold text-green-600">
                                                        Disponibles
                                                    </span>
                                                </p>
                                                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-black text-black">
                                                            S/{' '}
                                                            {parseFloat(
                                                                p.precio_venta ||
                                                                    0,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            p.id,
                                                        )}
                                                        className="rounded-xl bg-black p-2.5 text-white transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                                                    >
                                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                            visibility
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full rounded-2xl border border-slate-200 bg-white py-10 text-center">
                                    <p className="font-bold text-slate-500">
                                        No hay productos disponibles
                                        actualmente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Flecha derecha */}
                        <button
                            onClick={() => scrollSlider(rackCarouselRef, 1)}
                            className="absolute -right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </section>

                {/* Banner Instalación de Rack para TV */}
                <section className="relative w-full overflow-hidden bg-[#2D2D2D] py-16 lg:py-20">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                            backgroundSize: '22px 22px',
                        }}
                    ></div>

                    {/* Resplandores decorativos */}
                    <div className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] rounded-full bg-[#fea619]/10 blur-[120px]"></div>
                    <div className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-[#fea619]/15 blur-[120px]"></div>

                    <div className="relative mx-auto max-w-[1280px] px-6">
                        {/* Encabezado compacto */}
                        <div className="mb-12 flex flex-col items-center text-center lg:mb-14">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-[11px] font-black uppercase tracking-widest text-[#fea619] shadow-lg">
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">
                                    verified
                                </span>
                                Servicio de Instalación Profesional
                            </span>
                            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70 sm:text-base">
                                Instalación segura y garantizada en todo Lima.
                                Precios referenciales según distrito.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-3">
                            {/* Columna Izquierda: Bloque naranja sobresaliente */}
                            <div className="relative lg:-my-8">
                                {/* Capa trasera para dar profundidad */}
                                <div className="absolute -inset-2.5 hidden -rotate-2 rounded-[30px] bg-black/30 lg:block"></div>

                                <div className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br from-[#ffb95f] via-[#fea619] to-[#e8890d] px-9 py-12 shadow-2xl shadow-[#fea619]/30">
                                    {/* Marca de agua de TV */}
                                    <span translate="no" aria-hidden="true" className="material-symbols-outlined pointer-events-none absolute -bottom-8 -right-6 text-[140px] text-white/15 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                                        tv
                                    </span>
                                    <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl"></div>

                                    <div className="relative flex items-center justify-between">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner transition-transform group-hover:rotate-6 group-hover:scale-110">
                                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                                                hardware
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1 rounded-full bg-black/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow">
                                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-[12px]">
                                                verified
                                            </span>
                                            Garantizado
                                        </span>
                                    </div>

                                    <div className="relative">
                                        <h3 className="text-3xl font-black leading-[1.08] text-white drop-shadow-md lg:text-[2.6rem]">
                                            Instalación de Rack para TV
                                        </h3>
                                        <div className="mt-5 h-[3px] w-16 rounded-full bg-white"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Central: Información y Contacto */}
                            <div className="text-white">
                                <p className="border-l-4 border-[#fea619] pl-5 text-base leading-relaxed text-white/90 lg:text-lg">
                                    Si usted cuenta con un rack de tv nosotros
                                    realizamos la instalación sin ningún
                                    problema. Los precios pueden variar
                                    dependiendo del distrito.
                                </p>

                                <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <a
                                        href="https://wa.me/51941117410"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group/wa inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#fea619] px-4 py-4 text-sm font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-[#ffb95f] hover:shadow-2xl hover:shadow-[#fea619]/40 active:scale-95"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[#fea619] transition-transform group-hover/wa:scale-110">
                                            <FaWhatsapp className="text-lg" />
                                        </span>
                                        <span className="leading-tight">
                                            Contáctanos
                                        </span>
                                    </a>
                                    <a
                                        href="tel:+51941117410"
                                        className="group/tel inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 border-[#fea619] bg-[#2D2D2D] px-4 py-4 text-sm font-bold text-[#fea619] shadow-lg transition-all hover:scale-105 hover:bg-[#fea619] hover:text-black hover:shadow-2xl hover:shadow-[#fea619]/40 active:scale-95"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[#fea619] transition-transform group-hover/tel:scale-110">
                                            <FaPhone className="text-base" />
                                        </span>
                                        <span className="leading-tight">
                                            941 117 410
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* Columna Derecha: Precio y Detalle */}
                            <div className="text-white lg:text-right">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">
                                    Instalación desde
                                </h4>
                                <p className="mt-4 text-5xl font-black leading-none text-[#fea619] drop-shadow-lg [text-shadow:0_6px_40px_rgba(254,166,25,0.45)] lg:mt-5 lg:text-6xl xl:text-7xl">
                                    S/ 40.00
                                </p>

                                <div className="mt-8 space-y-4 lg:mt-9">
                                    <div className="flex items-center gap-3 border-b border-white/15 pb-4 lg:justify-end">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fea619]/15 text-[#fea619]">
                                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                check
                                            </span>
                                        </span>
                                        <p className="text-sm text-white/90">
                                            Instalación de rack para TV
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 lg:justify-end">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fea619]/15 text-[#fea619]">
                                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                check
                                            </span>
                                        </span>
                                        <p className="text-sm text-white/90">
                                            Instalamos cualquier tipo de rack
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Banner Promocional Ferretería */}
                <section className="relative mt-8 overflow-hidden bg-[#f7f9fb] py-4 lg:mt-12 lg:py-6">
                    <img
                        src={banner1}
                        alt=""
                        className="absolute inset-y-0 left-0 w-1/2 object-cover opacity-20"
                    />
                    <img
                        src={banner1}
                        alt=""
                        className="absolute inset-y-0 right-0 w-1/2 -scale-x-100 object-cover opacity-20"
                    />

                    <div className="relative mx-auto max-w-[1280px] px-6">
                        <div className="mx-auto max-w-3xl bg-[#eef1f4] px-6 py-8 text-center shadow-lg [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)] sm:px-16">
                            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#855300] shadow-sm">
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                    hardware
                                </span>
                                Ferretería CMA
                            </span>
                            <h2 className="mt-2 text-xl font-black uppercase leading-tight text-slate-900 sm:text-3xl">
                                {construccionTitle}
                            </h2>
                            <div className="mx-auto mt-3 h-[3px] w-12 rounded-full bg-[#fea619]"></div>
                            <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                                Todo lo que necesitas para construir, reparar y
                                mejorar. Calidad garantizada en cada herramienta
                                de las mejores marcas.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección de Productos Ferretería */}
                <section className="mx-auto max-w-[1280px] px-6 py-14">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            {construccionTitle}
                        </h2>
                        <Link
                            href={route(
                                'store.catalog',
                                construccionCategoryId
                                    ? { category: construccionCategoryId }
                                    : {},
                            )}
                            className="flex items-center gap-1.5 text-sm font-bold text-[#ef4444] transition-all hover:gap-2.5 hover:underline"
                        >
                            Ver todos los productos{' '}
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">
                                chevron_right
                            </span>
                        </Link>
                    </div>

                    <div className="relative">
                        {/* Flecha izquierda */}
                        <button
                            onClick={() =>
                                scrollSlider(ferreteriaCarouselRef, -1)
                            }
                            className="absolute -left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_left
                            </span>
                        </button>

                        <div
                            ref={ferreteriaCarouselRef}
                            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                        >
                            {construccionProducts.length > 0 ? (
                                construccionProducts.map((p) => {
                                    const imgUrl = p.imagen_url
                                        ? p.imagen_url.startsWith('http://') ||
                                          p.imagen_url.startsWith('https://')
                                            ? p.imagen_url
                                            : `/storage/${p.imagen_url}`
                                        : 'https://via.placeholder.com/300?text=Sin+Imagen';

                                    return (
                                        <div
                                            key={p.id}
                                            className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f7f9fb] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:w-[300px]"
                                        >
                                            <div className="relative flex h-64 items-center justify-center overflow-hidden bg-white p-6">
                                                <img
                                                    className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                                    src={imgUrl}
                                                    alt={p.nombre}
                                                />
                                                <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                                                    {p.marca?.nombre ||
                                                        p.categoria?.nombre ||
                                                        'CMA'}
                                                </span>
                                            </div>
                                            <div className="flex flex-grow flex-col p-5">
                                                <span className="mb-1 text-xs font-bold text-[#855300]">
                                                    {p.marca?.nombre
                                                        ? `${p.marca.nombre} · `
                                                        : ''}
                                                    SKU: {p.sku || 'N/A'}
                                                </span>
                                                <h4 className="mb-2 line-clamp-2 text-base font-bold text-black transition-colors group-hover:text-[#855300]">
                                                    {p.nombre}
                                                </h4>
                                                <p className="mb-4 text-xs text-slate-500">
                                                    Stock disponible:{' '}
                                                    <span className="font-bold text-green-600">
                                                        Disponibles
                                                    </span>
                                                </p>
                                                <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-black text-black">
                                                            S/{' '}
                                                            {parseFloat(
                                                                p.precio_venta ||
                                                                    0,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            p.id,
                                                        )}
                                                        className="rounded-xl bg-black p-2.5 text-white transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                                                    >
                                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                            visibility
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full rounded-2xl border border-slate-200 bg-white py-10 text-center">
                                    <p className="font-bold text-slate-500">
                                        No hay productos disponibles
                                        actualmente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Flecha derecha */}
                        <button
                            onClick={() =>
                                scrollSlider(ferreteriaCarouselRef, 1)
                            }
                            className="absolute -right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </section>

                {/* Widget Flotante de Atención */}
                <div className="fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3">
                    {showHelpWidget && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 relative rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-2xl duration-200">
                            <button
                                onClick={() => setShowHelpWidget(false)}
                                className="absolute -right-2.5 -top-2.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white shadow-md transition-transform hover:scale-110"
                            >
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm text-slate-600">
                                    close
                                </span>
                            </button>
                            <p className="text-sm font-bold text-slate-800">
                                Hola, ¿Puedo ayudarte?
                            </p>
                        </div>
                    )}
                    <a
                        href="https://wa.me/51941117410"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] shadow-2xl shadow-black/20 transition-transform hover:rotate-6 hover:scale-110"
                    >
                        <FaWhatsapp className="text-3xl text-white" />
                    </a>
                </div>

                {/* Sección de Productos Destacados */}
                <section className="mx-auto max-w-[1280px] px-6 py-14">
                    <div className="mb-8 flex items-start justify-between gap-4 sm:items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#fea619]/30 bg-[#fea619]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#855300]">
                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                    local_fire_department
                                </span>
                                Top Ventas
                            </span>
                            <h2 className="mt-3 text-xl font-bold text-slate-800 sm:text-2xl">
                                Más Vendidos / Favoritos
                            </h2>
                        </div>
                        <Link
                            href={route('store.catalog')}
                            className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-[#ef4444] transition-all hover:gap-2.5 hover:underline"
                        >
                            Ver todos los productos{' '}
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">
                                chevron_right
                            </span>
                        </Link>
                    </div>

                    <div className="relative">
                        {/* Flecha izquierda */}
                        <button
                            onClick={() =>
                                scrollSlider(featuredCarouselRef, -1)
                            }
                            className="absolute -left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_left
                            </span>
                        </button>

                        <div
                            ref={featuredCarouselRef}
                            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                        >
                            {productList.length > 0 ? (
                                productList.map((item) => {
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
                                                        item.categoria
                                                            ?.nombre ||
                                                        'CMA'}
                                                </span>
                                            </div>
                                            <div className="flex flex-grow flex-col p-5">
                                                <span className="mb-1 text-xs font-bold text-[#855300]">
                                                    {item.marca?.nombre
                                                        ? `${item.marca.nombre} · `
                                                        : ''}
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
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xl font-black text-black">
                                                            S/{' '}
                                                            {parseFloat(
                                                                item.precio_venta ||
                                                                    0,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <Link
                                                        href={route(
                                                            'store.detail',
                                                            item.id,
                                                        )}
                                                        className="rounded-xl bg-black p-2.5 text-white transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                                                    >
                                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                            visibility
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full rounded-2xl border border-slate-200 bg-white py-10 text-center">
                                    <p className="font-bold text-slate-500">
                                        No hay productos disponibles
                                        actualmente.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Flecha derecha */}
                        <button
                            onClick={() => scrollSlider(featuredCarouselRef, 1)}
                            className="absolute -right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all hover:scale-110 hover:bg-[#fea619] hover:text-black active:scale-95"
                        >
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined text-xl font-bold text-black">
                                chevron_right
                            </span>
                        </button>
                    </div>
                </section>

                {/* ¿Por qué elegirnos? */}
                <section className="mx-auto max-w-[1280px] px-6 py-20">
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#fea619]/10 blur-[100px]"></div>

                        <div className="grid grid-cols-1 items-center gap-14 p-8 sm:p-14 lg:grid-cols-2">
                            {/* Columna Texto */}
                            <div className="relative">
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#fea619]/30 bg-[#fea619]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#855300]">
                                    <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                        volunteer_activism
                                    </span>
                                    Nuestro Compromiso
                                </span>
                                <h2 className="mt-5 text-3xl font-black leading-tight text-black sm:text-4xl">
                                    ¿Por qué elegir{' '}
                                    <span className="text-[#855300]">
                                        Ferretería CMA?
                                    </span>
                                </h2>
                                <p className="mt-4 max-w-md leading-relaxed text-slate-500">
                                    Trabajamos con las marcas de mayor confianza
                                    del mercado y ofrecemos asesoría técnica
                                    para que compres con total seguridad y
                                    respaldo.
                                </p>

                                <ul className="mt-8 space-y-4">
                                    {[
                                        'Precios competitivos para ferreteros y contratistas',
                                        'Instalación profesional de racks y soportes para TV',
                                        'Atención personalizada y asesoría de instalación',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-3"
                                        >
                                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fea619]/15 text-[#855300]">
                                                <span translate="no" aria-hidden="true" className="material-symbols-outlined text-sm">
                                                    check
                                                </span>
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={route('store.catalog')}
                                    className="mt-9 inline-flex items-center gap-2.5 rounded-full bg-black px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105 hover:bg-[#fea619] hover:text-black active:scale-95"
                                >
                                    Explorar Catálogo
                                    <span translate="no" aria-hidden="true" className="material-symbols-outlined text-base">
                                        arrow_forward
                                    </span>
                                </Link>
                            </div>

                            {/* Columna Tarjetas */}
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="group rounded-2xl border border-slate-200 bg-[#f7f9fb] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fea619]/15 text-[#855300] transition-transform group-hover:rotate-6 group-hover:scale-110">
                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                                            verified
                                        </span>
                                    </span>
                                    <h3 className="mt-4 font-bold text-black">
                                        Marcas Líderes
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        Pretul, Stanley, Truper, Strutek y
                                        Soportex Innova.
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                                        <img
                                            src={pretulLogo}
                                            alt="Pretul"
                                            className="h-5 w-auto object-contain grayscale transition-all hover:grayscale-0"
                                        />
                                        <img
                                            src={stanleyLogo}
                                            alt="Stanley"
                                            className="h-5 w-auto object-contain grayscale transition-all hover:grayscale-0"
                                        />
                                        <img
                                            src={truperLogo}
                                            alt="Truper"
                                            className="h-5 w-auto object-contain grayscale transition-all hover:grayscale-0"
                                        />
                                    </div>
                                </div>

                                <div className="group rounded-2xl border border-slate-200 bg-[#f7f9fb] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fea619]/15 text-[#855300] transition-transform group-hover:rotate-6 group-hover:scale-110">
                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                                            local_shipping
                                        </span>
                                    </span>
                                    <h3 className="mt-4 font-bold text-black">
                                        Entrega
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        tu pedido lo puedes retirar en
                                        tienda.
                                    </p>
                                </div>

                                <div className="group rounded-2xl border border-slate-200 bg-[#f7f9fb] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fea619]/15 text-[#855300] transition-transform group-hover:rotate-6 group-hover:scale-110">
                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                                            verified_user
                                        </span>
                                    </span>
                                    <h3 className="mt-4 font-bold text-black">
                                        Garantía CMA
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        Respaldo y reposición por defectos de
                                        fábrica en productos certificados.
                                    </p>
                                </div>

                                <div className="group rounded-2xl border border-slate-200 bg-[#f7f9fb] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fea619]/15 text-[#855300] transition-transform group-hover:rotate-6 group-hover:scale-110">
                                        <span translate="no" aria-hidden="true" className="material-symbols-outlined text-2xl">
                                            handyman
                                        </span>
                                    </span>
                                    <h3 className="mt-4 font-bold text-black">
                                        Asesoría Técnica
                                    </h3>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                                        Te orientamos a elegir la herramienta o
                                        material correcto para cada trabajo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <StoreFooter />
        </div>
    );
}
