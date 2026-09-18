import ClientForm from '@/Components/Clients/ClientForm';
import CommonModal from '@/Components/CommonModal';
import SaleDetailsPanel from '@/Components/Sales/SaleDetailsPanel';
import SaleOptionsModal from '@/Components/Sales/SaleOptionsModal';
import SaleSummaryPanel from '@/Components/Sales/SaleSummaryPanel';
import { useCartStore } from '@/Hooks/useCartStore';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { Package, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function Checkout({
    serie,
    numero,
    igv,
    metodos_pago,
    productos,
}) {
    const { config, flash } = usePage().props;

    const {
        items: cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        setDiscount,
        clearCart,
        getSubtotal: cartSubtotal,
        getTotal: cartTotal,
        getDiscountTotal: cartDiscount,
    } = useCartStore();

    const [tipoComprobante, setTipoComprobante] = useState('Boleta');
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientResults, setClientResults] = useState([]);
    const [isSearchingClients, setIsSearchingClients] = useState(false);
    const [isClientModalOpen, setClientModalOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [isUnitModalOpen, setUnitModalOpen] = useState(false);
    const [productForUnits, setProductForUnits] = useState(null);

    const metodosPago = useMemo(() => {
        const list =
            Array.isArray(metodos_pago) && metodos_pago.length > 0
                ? metodos_pago
                : Array.isArray(config?.metodos_pago)
                  ? config.metodos_pago
                  : [];
        return list.length > 0
            ? list
            : ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'];
    }, [metodos_pago, config]);

    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [paidWith, setPaidWith] = useState('');

    const [sale, setSale] = useState(null);
    const [isOptionsModalOpen, setOptionsModalOpen] = useState(false);
    const lastSaleIdRef = useRef(null);

    const igvRate = useMemo(
        () => parseFloat(igv ?? config?.igv ?? 18) || 18,
        [igv, config],
    );
    const subtotal = cartSubtotal();
    const descuentoTotal = cartDiscount();
    const total = cartTotal();
    const igvAmount = (total * (igvRate / 100)) / (1 + igvRate / 100);
    const vuelto = useMemo(
        () => Math.max(0, (parseFloat(paidWith) || 0) - total),
        [paidWith, total],
    );
    const montoValido = useMemo(() => {
        if (paidWith.trim() === '') return false;
        const amount = parseFloat(paidWith);
        return !Number.isNaN(amount) && amount > 0 && amount > total;
    }, [paidWith, total]);

    // Búsqueda AJAX de clientes con debounce de 300ms
    useEffect(() => {
        if (!customerSearch.trim()) {
            setClientResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setIsSearchingClients(true);
            try {
                const res = await fetch(
                    `/clientes/search?q=${encodeURIComponent(customerSearch)}`,
                );
                const data = await res.json();
                setClientResults(data);
            } catch {
                setClientResults([]);
            } finally {
                setIsSearchingClients(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [customerSearch]);

    // Cuando el backend confirma la venta, abrimos OPCIONES DE VENTA
    useEffect(() => {
        if (flash?.last_sale && flash.last_sale.id !== lastSaleIdRef.current) {
            lastSaleIdRef.current = flash.last_sale.id;
            setSale(flash.last_sale);
            setOptionsModalOpen(true);
            clearCart();
            setSelectedClient(null);
            setCustomerSearch('');
            setPaidWith('');
            setPaymentMethod('Efectivo');
        }
    }, [flash]);

    // Lógica del Escáner de Código de Barras
    const barcodeBuffer = useRef('');
    const lastKeyTime = useRef(Date.now());

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
                return;

            const currentTime = Date.now();
            if (currentTime - lastKeyTime.current > 50) {
                barcodeBuffer.current = '';
            }
            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (barcodeBuffer.current.length > 3) {
                    processBarcode(barcodeBuffer.current);
                    barcodeBuffer.current = '';
                    e.preventDefault();
                }
            } else if (e.key.length === 1) {
                barcodeBuffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productos, cart]);

    const processBarcode = (code, showToastOnError = true) => {
        let product = productos.find(
            (p) => p.codigo_barras === code || p.sku === code,
        );
        if (product) {
            const baseUnit =
                product.conversiones && product.conversiones.length > 0
                    ? {
                          isBase: true,
                          unidad: {
                              nombre: product.unidad_medida,
                          },
                          precio_venta: product.precio_venta,
                          factor: 1,
                      }
                    : null;
            handleAddToCart(product, baseUnit);
            return true;
        }

        for (const p of productos) {
            const conv = p.conversiones.find((c) => c.codigo_barras === code);
            if (conv) {
                handleAddToCart(p, conv);
                return true;
            }
        }

        if (showToastOnError) {
            toast.error(`Código no encontrado: ${code}`);
        }
        return false;
    };

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const search = searchTerm.toLowerCase();
        return productos
            .filter(
                (p) =>
                    p.nombre.toLowerCase().includes(search) ||
                    (p.sku && p.sku.toLowerCase().includes(search)) ||
                    (p.codigo_barras && p.codigo_barras.includes(search)),
            )
            .slice(0, 12);
    }, [productos, searchTerm]);

    const handleAddToCart = (product, unit = null) => {
        if (!unit && product.conversiones && product.conversiones.length > 0) {
            setProductForUnits(product);
            setUnitModalOpen(true);
            return;
        }

        const factor = unit ? parseFloat(unit.factor) : 1;
        const requestedQty = 1;
        const physicalUnitsRequested = requestedQty * factor;

        const totalPhysicalInCart = cart.reduce((t, item) => {
            if (item.id === product.id) {
                const itemFactor = item.factor || 1;
                return t + item.quantity * itemFactor;
            }
            return t;
        }, 0);

        const totalNeeded = totalPhysicalInCart + physicalUnitsRequested;

        if (product.stock < totalNeeded) {
            toast.error(
                `Stock insuficiente. Solo quedan ${product.stock} ${product.unidad_medida} en total.`,
            );
            return;
        }

        addToCart(product, unit);
        const unitName = unit
            ? unit.unidad
                ? unit.unidad.nombre
                : 'Presentación'
            : product.unidad_medida;
        toast.success(`${product.nombre} (${unitName}) añadido`);
        setUnitModalOpen(false);
        setSearchTerm('');
    };

    const handlePay = () => {
        if (cart.length === 0) {
            toast.error('El carrito está vacío');
            return;
        }
        if (paymentMethod === 'Efectivo') {
            const amount = parseFloat(paidWith);
            if (paidWith.trim() === '' || Number.isNaN(amount)) {
                toast.error('Ingresa el monto recibido');
                return;
            }
            if (amount <= 0) {
                toast.error('El monto recibido debe ser mayor a 0');
                return;
            }
            if (amount < total) {
                toast.error('Monto insuficiente');
                return;
            }
            if (amount <= total) {
                toast.error('El monto recibido debe ser mayor al total');
                return;
            }
        }

        router.post(
            route('ventas.store'),
            {
                total: total,
                descuento: descuentoTotal,
                metodo_pago: paymentMethod,
                tipo_comprobante: tipoComprobante,
                cliente_id: selectedClient?.id || null,
                items: cart.map((item) => ({
                    producto_id: item.id,
                    cantidad: item.quantity,
                    precio_unitario: item.precio,
                    unidad_id: item.unit_id,
                    conversion_id: item.conversion_id,
                    descuento: item.discount || 0,
                })),
            },
            {
                onSuccess: () => toast.success('Venta registrada'),
                onError: (err) =>
                    toast.error(err.error || 'Error al procesar la venta'),
            },
        );
    };

    const handleCloseOptions = () => {
        setOptionsModalOpen(false);
        router.visit(route('venta-rapida'));
    };

    const handleNewSale = () => {
        clearCart();
        setSelectedClient(null);
        setCustomerSearch('');
        setPaidWith('');
        setPaymentMethod('Efectivo');
        setSearchTerm('');
        setTipoComprobante('Boleta');
        setOptionsModalOpen(false);
        router.visit(route('venta-rapida'));
    };

    const updateQty = (id, conversionId, qty) =>
        updateQuantity(id, conversionId, qty);

    const removeItem = (id, conversionId) => removeFromCart(id, conversionId);

    const selectClient = (c) => {
        setSelectedClient(c);
        setCustomerSearch('');
        setClientResults([]);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Realizar Venta" />

            <div className="-mx-2 -mt-2 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:-mx-4 sm:-mt-4 sm:p-6 lg:-mx-6 lg:-mt-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                        onClick={handleNewSale}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
                    >
                        <Plus size={16} /> Nueva Venta
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-violet-600" />
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 sm:text-2xl">
                                Realizar Venta
                            </h1>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-slate-500">
                            Confirma los datos y el método de pago para
                            completar la venta
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <span className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
                            {serie || 'B001'}
                        </span>
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                            Nº{' '}
                            <span className="text-slate-800">
                                {numero || '000001'}
                            </span>
                        </span>
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                            IGV {igvRate.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
                            <ShoppingCart
                                size={40}
                                className="text-slate-300"
                            />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">
                            No hay productos para cobrar
                        </h3>
                        <p className="mb-6 mt-1 text-sm text-slate-500">
                            Agrega productos desde el buscador de la derecha.
                        </p>
                        <button
                            onClick={handleNewSale}
                            className="rounded-xl bg-violet-600 px-6 py-3 font-black text-white shadow-lg shadow-violet-100 transition-all hover:bg-violet-700 active:scale-95"
                        >
                            Nueva Venta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Columna izquierda: Datos Generales (comprobante, cliente, método de pago, Realizar Venta) */}
                        <div className="lg:col-span-1">
                            <SaleSummaryPanel
                                metodosPago={metodosPago}
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                tipoComprobante={tipoComprobante}
                                setTipoComprobante={setTipoComprobante}
                                selectedClient={selectedClient}
                                customerSearch={customerSearch}
                                setCustomerSearch={(value) => {
                                    setCustomerSearch(value);
                                    if (selectedClient) setSelectedClient(null);
                                }}
                                clientResults={clientResults}
                                isSearchingClients={isSearchingClients}
                                selectClient={selectClient}
                                openClientModal={() => setClientModalOpen(true)}
                                disabled={
                                    cart.length === 0 ||
                                    (paymentMethod === 'Efectivo' &&
                                        !montoValido)
                                }
                                onPay={handlePay}
                            />
                        </div>

                        {/* Columna derecha: Detalles de Venta (buscador, tabla, resumen, monto recibido/vuelto) */}
                        <div className="lg:col-span-2">
                            <SaleDetailsPanel
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filteredProducts={filteredProducts}
                                addToCart={handleAddToCart}
                                cart={cart}
                                updateQty={updateQty}
                                removeItem={removeItem}
                                setDiscount={setDiscount}
                                igvRate={igvRate / 100}
                                subtotal={subtotal}
                                discountTotal={descuentoTotal}
                                igv={igvAmount}
                                total={total}
                                paidWith={paidWith}
                                setPaidWith={setPaidWith}
                                vuelto={vuelto}
                                isValidMonto={montoValido}
                                paymentMethod={paymentMethod}
                                isScanning={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            <CommonModal
                isOpen={isClientModalOpen}
                onClose={() => setClientModalOpen(false)}
                title="Nuevo Cliente"
            >
                <ClientForm onClose={() => setClientModalOpen(false)} />
            </CommonModal>

            <CommonModal
                isOpen={isUnitModalOpen}
                onClose={() => setUnitModalOpen(false)}
                title="Seleccionar Presentación"
            >
                <div className="space-y-4">
                    <p className="mb-4 text-sm font-medium text-slate-600">
                        Elige cómo deseas vender este producto:
                    </p>
                    <button
                        onClick={() =>
                            handleAddToCart(productForUnits, {
                                isBase: true,
                                unidad: {
                                    nombre: productForUnits.unidad_medida,
                                },
                                precio_venta: productForUnits.precio_venta,
                                factor: 1,
                            })
                        }
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-violet-400 hover:bg-violet-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-white p-2 text-slate-400 shadow-sm">
                                <Package size={20} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-800">
                                    {productForUnits?.unidad_medida}
                                </p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                    Unidad Base
                                </p>
                            </div>
                        </div>
                        <span className="text-lg font-black text-indigo-600">
                            S/{' '}
                            {parseFloat(
                                productForUnits?.precio_venta || 0,
                            ).toFixed(2)}
                        </span>
                    </button>

                    {productForUnits?.conversiones.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() =>
                                handleAddToCart(productForUnits, conv)
                            }
                            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-violet-400 hover:bg-violet-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-white p-2 text-slate-400 shadow-sm">
                                    <Package size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">
                                        {conv.unidad.nombre}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">
                                        Equivale a {parseFloat(conv.factor)}{' '}
                                        {productForUnits?.unidad_medida}
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-indigo-600">
                                S/ {parseFloat(conv.precio_venta).toFixed(2)}
                            </span>
                        </button>
                    ))}

                    <button
                        onClick={() => setUnitModalOpen(false)}
                        className="w-full py-3 text-sm font-bold text-slate-400 transition-colors hover:text-slate-600"
                    >
                        Cancelar
                    </button>
                </div>
            </CommonModal>

            <SaleOptionsModal
                isOpen={isOptionsModalOpen}
                onClose={() => setOptionsModalOpen(false)}
                onNewSale={handleCloseOptions}
                sale={sale}
            />
        </AuthenticatedLayout>
    );
}
