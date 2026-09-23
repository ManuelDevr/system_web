import { Link } from '@inertiajs/react';
import whatsappIcon from '@/Assets/whatsapp-icon.png';

export default function StoreFooter() {
    return (
        <footer className="border-t border-slate-800 bg-black py-12 text-white">
            <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-6 text-sm md:grid-cols-4">
                <div>
                    <span className="mb-3 block text-lg font-black uppercase tracking-wider text-white">
                        CMA Store
                    </span>
                    <p className="text-xs leading-relaxed text-slate-400">
                        Racks para TV, ferretería e instalación garantizada.
                    </p>
                </div>
                <div>
                    <h5 className="mb-3 text-xs font-bold uppercase text-[#fea619]">
                        Navegación
                    </h5>
                    <ul className="space-y-2 text-xs text-slate-400">
                        <li>
                            <Link
                                href={route('store.index')}
                                className="transition-colors hover:text-white"
                            >
                                Inicio
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={route('store.catalog')}
                                className="transition-colors hover:text-white"
                            >
                                Catálogo de Productos
                            </Link>
                        </li>
                    </ul>
                    <ul className="mt-4 space-y-2 border-t border-white/10 pt-3 text-xs">
                        <li>
                            <Link
                                href={route('store.privacidad')}
                                className="transition-colors hover:text-white"
                            >
                                Política de Privacidad
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={route('store.terminos')}
                                className="transition-colors hover:text-white"
                            >
                                Términos y Condiciones
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={route('store.aviso-legal')}
                                className="transition-colors hover:text-white"
                            >
                                Aviso Legal
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h5 className="mb-3 text-xs font-bold uppercase text-[#fea619]">
                        Contacto
                    </h5>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                        <li className="flex items-start gap-2">
                            <img
                                src={whatsappIcon}
                                alt="WhatsApp"
                                className="mt-0.5 h-5 w-5 shrink-0"
                            />
                            <span>
                                <span className="block font-bold text-slate-300">
                                    WhatsApp
                                </span>
                                <a
                                    href="https://wa.me/51941117410"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-colors hover:text-white"
                                >
                                    941 117 410
                                </a>
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-[#fea619]">
                                mail
                            </span>
                            <span>
                                <span className="block font-bold text-slate-300">
                                    Email
                                </span>
                                cma.tiendaoficial@gmail.com
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span translate="no" aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-[#fea619]">
                                schedule
                            </span>
                            <span>
                                <span className="block font-bold text-slate-300">
                                    Horario
                                </span>
                                Lun a Vie: 9:00 am – 6:00 pm · Sáb: 9:00 am –
                                2:00 pm
                            </span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h5 className="mb-3 text-xs font-bold uppercase text-[#fea619]">
                        Ubicación
                    </h5>
                    <p className="text-xs text-slate-400">
                        San Juan de Miraflores Av Salvador Allende 429 - Tienda
                        Principal CMA
                    </p>
                </div>
            </div>
            <div className="mx-auto mt-8 max-w-[1280px] border-t border-white/10 px-6 pt-8 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} CMA Store. Todos los derechos
                reservados.
            </div>
        </footer>
    );
}
