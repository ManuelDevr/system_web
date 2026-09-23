import StoreFooter from '@/Components/StoreFooter';
import StoreHeader from '@/Components/StoreHeader';
import { Head } from '@inertiajs/react';

const CONTENIDO = {
    privacidad: {
        titulo: 'Política de Privacidad',
        updated: 'Última actualización: septiembre de 2026',
        sections: [
            {
                titulo: '1. Responsable del tratamiento',
                texto: 'CMA Store (razón social y RUC pendientes de completar). Los datos personales proporcionados a través de este sitio web serán tratados por el responsable de manera confidencial y conforme a la normativa peruana de protección de datos personales (Ley N.º 29733 y su Reglamento).',
            },
            {
                titulo: '2. Datos que tratamos',
                texto: 'Cuando realizas una consulta o contacto a través de nuestro sitio (formularios, WhatsApp o correo: cma.tiendaoficial@gmail.com), tratamos únicamente los datos que nos facilitas: nombre, correo electrónico, teléfono y el contenido de tu mensaje. No registramos datos de tarjetas ni realizamos cobros a través de esta web.',
            },
            {
                titulo: '3. Finalidades',
                texto: 'Atender tus consultas y solicitudes de información, cotizar productos (racks de TV, ferretería, instalación), y mantenerte informado de ofertas si así lo autorizas. No cedemos tus datos a terceros salvo obligación legal.',
            },
            {
                titulo: '4. Base de legitimación y conservación',
                texto: 'Tratamos tus datos con tu consentimiento (art. 13 Ley 29733) y los conservamos únicamente mientras sea necesario para atender tu solicitud, y posteriormente por el plazo legal aplicable.',
            },
            {
                titulo: '5. Tus derechos',
                texto: 'Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiéndonos a cma.tiendaoficial@gmail.com, indicando tu nombre y el derecho que deseas ejercer.',
            },
            {
                titulo: '6. Cookies',
                texto: 'Este sitio utiliza únicamente cookies técnicas o de personalización imprescindibles para su funcionamiento correcto (por ejemplo, recordar tu aceptación de este aviso). No empleamos cookies publicitarias ni de seguimiento de terceros.',
            },
        ],
    },
    terminos: {
        titulo: 'Términos y Condiciones',
        updated: 'Última actualización: septiembre de 2026',
        sections: [
            {
                titulo: '1. Objeto',
                texto: 'Estos términos regulan el uso del sitio web de CMA Store y la adquisición de sus productos (racks y soportes para TV, artículos de ferretería y servicio de instalación).',
            },
            {
                titulo: '2. Precios y disponibilidad',
                texto: 'Los precios están expresados en soles (S/), son referenciales, incluyen IGV y están sujetos a cambios sin previo aviso. La disponibilidad de stock puede variar; confirmamos pedidos vía WhatsApp al 941 117 410.',
            },
            {
                titulo: '3. Pedidos y forma de pago',
                texto: 'Los pedidos se tramitan por WhatsApp o en tienda. No realizamos cobros por esta web. La entrega e instalación de racks se coordina con el cliente (San Juan de Miraflores, Av. Salvador Allende 429 - Tienda Principal CMA).',
            },
            {
                titulo: '4. Garantías y devoluciones',
                texto: 'Los productos cuentan con la garantía del fabricante. Las devoluciones se aceptan dentro de los 7 días calendario con el producto en su empaque original y previa coordinación.',
            },
            {
                titulo: '5. Responsabilidad',
                texto: 'CMA Store no se hace responsable por el uso indebido de los productos ni por daños derivados de una instalación no autorizada. La información de la web es meramente orientativa.',
            },
            {
                titulo: '6. Legislación aplicable',
                texto: 'Estos términos se rigen por la legislación peruana. Cualquier controversia será sometida a los tribunales de Lima, Perú.',
            },
        ],
    },
    'aviso-legal': {
        titulo: 'Aviso Legal',
        updated: 'Última actualización: septiembre de 2026',
        sections: [
            {
                titulo: '1. Titular del sitio',
                texto: 'Titular: CMA Store — Razón social: (PENDIENTE). RUC: (PENDIENTE). Domicilio: San Juan de Miraflores, Av. Salvador Allende 429 - Tienda Principal CMA. Contacto: cma.tiendaoficial@gmail.com · WhatsApp 941 117 410.',
            },
            {
                titulo: '2. Propiedad intelectual',
                texto: 'Los contenidos, diseño y elementos gráficos de este sitio son titularidad de CMA Store o de sus respectivos dueños, salvo los logotipos de marcas (Stanley, Truper, Pretul, SoporteX, Strutek, Gyplac) que pertenecen a sus fabricantes y se muestran a título informativo.',
            },
            {
                titulo: '3. Uso del sitio',
                texto: 'El acceso al sitio no genera derecho alguno sobre los contenidos. Queda prohibido el uso de este sitio para fines ilícitos o que lesionen derechos de terceros.',
            },
            {
                titulo: '4. Enlaces',
                texto: 'Este sitio puede contener enlaces a WhatsApp, correos u otras plataformas externas sobre las que no tenemos control. No respondemos por el contenido o políticas de privacidad de esos terceros.',
            },
        ],
    },
};

export default function Legal({ tipo = 'aviso-legal', categorias = [] }) {
    const contenido = CONTENIDO[tipo] || CONTENIDO['aviso-legal'];

    return (
        <>
            <Head title={contenido.titulo} />

            <div className="flex min-h-screen flex-col bg-[#0b1220] text-slate-100">
                <StoreHeader categorias={categorias} />

                <main className="mx-auto w-full max-w-[1280px] flex-grow px-6 py-10">
                    <nav className="mb-6 text-xs text-slate-400">
                        <span className="text-slate-500">Inicio</span>
                        <span className="mx-2 text-slate-600">/</span>
                        <span className="font-semibold text-[#fea619]">{contenido.titulo}</span>
                    </nav>

                    <div className="rounded-3xl border border-slate-800 bg-[#101828] p-8 md:p-12">
                        <h1 className="text-3xl font-black uppercase tracking-tighter md:text-4xl">{contenido.titulo}</h1>
                        <p className="mt-2 text-xs uppercase tracking-widest text-slate-500">{contenido.updated}</p>

                        <div className="mt-10 space-y-8">
                            {contenido.sections.map((section) => (
                                <div key={section.titulo}>
                                    <h2 className="mb-2 text-lg font-bold text-white">{section.titulo}</h2>
                                    <p className="text-sm leading-relaxed text-slate-400">{section.texto}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <StoreFooter />
            </div>
        </>
    );
}
