import { Link } from '@inertiajs/react';
import { Cookie, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cma_cookies_aceptadas';

export default function StoreCookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const guardado = localStorage.getItem(STORAGE_KEY);
        setVisible(!guardado);
    }, []);

    const aceptar = () => {
        localStorage.setItem(STORAGE_KEY, 'aceptadas');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            role="region"
            aria-label="Aviso de cookies"
            className="fixed inset-x-0 bottom-0 z-[1100] animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
            <div className="mx-auto mb-4 flex w-[min(1000px,calc(100vw-2rem))] flex-col gap-4 rounded-2xl border border-slate-700 bg-[#0f172a]/95 p-5 shadow-2xl backdrop-blur sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                    <span
                        translate="no"
                        aria-hidden="true"
                        className="material-symbols-outlined mt-0.5 text-2xl text-[#fea619]"
                    >
                        cookie
                    </span>
                    <p className="text-xs leading-relaxed text-slate-300">
                        Usamos cookies técnicas e imprescindibles para que este
                        sitio funcione correctamente (por ejemplo, recordar tu
                        preferencia y tu carrito). No usamos cookies de
                        publicidad ni de seguimiento de terceros.{' '}
                        <Link
                            href={route('store.privacidad')}
                            className="font-bold text-[#fea619] hover:underline"
                        >
                            Más información
                        </Link>
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <button
                        type="button"
                        onClick={aceptar}
                        className="rounded-xl bg-[#fea619] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-[#ffc24d]"
                    >
                        Aceptar
                    </button>
                    <button
                        type="button"
                        onClick={aceptar}
                        aria-label="Cerrar aviso de cookies"
                        className="rounded-xl border border-slate-600 p-2.5 text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
