import {
    Banknote,
    CheckCircle,
    CreditCard,
    Landmark,
    Search,
    Smartphone,
    User,
} from 'lucide-react';

const paymentIcons = {
    Efectivo: Banknote,
    Transferencia: Landmark,
    Yape: Smartphone,
    Plin: Smartphone,
    BCP: Landmark,
};

export default function SaleSummaryPanel({
    metodosPago,
    paymentMethod,
    setPaymentMethod,
    tipoComprobante,
    setTipoComprobante,
    selectedClient,
    customerSearch,
    setCustomerSearch,
    clientResults,
    isSearchingClients,
    selectClient,
    openClientModal,
    disabled,
    onPay,
}) {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                <h2 className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                        <User size={16} />
                    </span>
                    Datos Generales
                </h2>

                {/* Tipo de Comprobante */}
                <div className="space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Tipo de Comprobante
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Boleta', 'Factura', 'Ticket'].map((tipo) => (
                            <button
                                key={tipo}
                                onClick={() => setTipoComprobante(tipo)}
                                className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition-all ${
                                    tipoComprobante === tipo
                                        ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-slate-800'
                                }`}
                            >
                                {tipo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cliente */}
                <div className="mt-5 space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Cliente {selectedClient ? '' : '(opcional)'}
                    </label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                placeholder={
                                    selectedClient
                                        ? selectedClient.nombre
                                        : 'Buscar por nombre o DNI/RUC...'
                                }
                                value={customerSearch}
                                onChange={(e) =>
                                    setCustomerSearch(e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-violet-500 focus:ring-0"
                            />
                            {clientResults.length > 0 &&
                                customerSearch.trim() &&
                                !selectedClient && (
                                    <div className="custom-scrollbar absolute z-50 mt-2 max-h-48 w-full overflow-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl">
                                        {isSearchingClients ? (
                                            <div className="px-4 py-3 text-center text-sm text-slate-400">
                                                Buscando...
                                            </div>
                                        ) : (
                                            clientResults.map((c) => (
                                                <button
                                                    key={c.id}
                                                    onClick={() =>
                                                        selectClient(c)
                                                    }
                                                    className="w-full border-b border-slate-50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-violet-50"
                                                >
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {c.nombre}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {c.ruc_dni ||
                                                            'Sin documento'}
                                                    </p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                        </div>
                        <button
                            onClick={openClientModal}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-500 transition-all hover:bg-slate-50"
                            title="Nuevo Cliente"
                        >
                            <User size={16} />
                        </button>
                    </div>
                </div>

                {/* Método de Pago */}
                <div className="mt-5 space-y-2">
                    <label className="mb-1 block text-[11px] font-black uppercase tracking-widest text-slate-500">
                        Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                        {metodosPago.map((method) => {
                            const Icon = paymentIcons[method] || CreditCard;
                            const active = paymentMethod === method;
                            return (
                                <button
                                    key={method}
                                    onClick={() => {
                                        setPaymentMethod(method);
                                        if (method !== 'Efectivo')
                                            setPaidWith('');
                                    }}
                                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold transition-all ${
                                        active
                                            ? 'border-violet-600 bg-violet-600 text-white shadow-md shadow-violet-100'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-slate-700'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {method}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Botón Realizar Venta */}
                <button
                    onClick={onPay}
                    disabled={disabled}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-violet-100 transition-all hover:bg-violet-700 active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-violet-600"
                >
                    <CheckCircle size={20} />
                    Realizar Venta
                </button>
                <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    El stock y el kardex se actualizarán automáticamente
                </p>
            </section>
        </div>
    );
}
