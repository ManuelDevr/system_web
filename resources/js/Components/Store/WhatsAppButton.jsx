/**
 * Botón / enlace dinámico de WhatsApp para el catálogo web.
 *
 * Genera: https://wa.me/PHONE?text=<mensaje codificado>
 * con un mensaje breve y el nombre del producto para la consulta al dueño.
 *
 * Props:
 *   - product      : objeto con { nombre }
 *   - phone        : número de WhatsApp (internacional, sin "+")
 *   - message      : mensaje base opcional
 *   - variant      : "primary" | "secondary" | "floating"
 *   - className    : clases extra de Tailwind
 */
export default function WhatsAppButton({
    product,
    phone,
    message,
    variant = 'primary',
    className = '',
}) {
    if (!phone) return null;

    const nombre = product?.nombre?.trim() || 'Producto';

    const text = [message || 'Hola, me interesa este producto:', `*${nombre}*`]
        .filter(Boolean)
        .join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    const styles = {
        primary:
            'bg-[#25D366] hover:bg-[#1fc257] text-white shadow-lg shadow-green-500/20',
        secondary:
            'bg-white border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10',
        floating:
            'fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl bg-[#25D366] hover:bg-[#1fc257] text-white',
    };

    const base =
        'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer hover:scale-105 active:scale-95';
    const shape = variant === 'floating' ? '' : 'h-12 px-6 rounded-xl';

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${base} ${shape} ${styles[variant]} ${className}`}
        >
            {variant === 'floating' ? (
                <svg
                    viewBox="0 0 32 32"
                    className="h-7 w-7 fill-current"
                    aria-hidden="true"
                >
                    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.7c1.8.9 3.8 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-.9l-.4-.2-3.4.7.7-3.3-.2-.4c-.9-1.6-1.4-3.4-1.4-5.2C5.3 11 10.1 6.2 16 6.2S26.7 11 26.7 16 22.9 24.8 16 24.8zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.2s-.3.2-.6.1c-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.5-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5c-.1-.1-.7-1.7-1-2.4-.2-.7-.5-.6-.7-.6h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" />
                </svg>
            ) : (
                <svg
                    viewBox="0 0 32 32"
                    className="h-5 w-5 fill-current"
                    aria-hidden="true"
                >
                    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.7c1.8.9 3.8 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-.9l-.4-.2-3.4.7.7-3.3-.2-.4c-.9-1.6-1.4-3.4-1.4-5.2C5.3 11 10.1 6.2 16 6.2S26.7 11 26.7 16 22.9 24.8 16 24.8zm5.5-7.5c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.1c-.2.3-.8 1-.9 1.2s-.3.2-.6.1c-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.5-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5c-.1-.1-.7-1.7-1-2.4-.2-.7-.5-.6-.7-.6h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" />
                </svg>
            )}
            <span>{variant === 'floating' ? '' : 'Atención por WhatsApp'}</span>
        </a>
    );
}
