import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Printer } from 'lucide-react';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import Ticket from './Ticket';

export default function SaleDetailModal({ isOpen, onClose, sale }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const ticketRef = useRef();

    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket_${sale?.nro_comprobante || 'Venta'}`,
    });

    if (!isOpen || !sale) return null;

    const handleCancel = () => {
        router.patch(route('ventas.cancel', sale.id), {}, {
            onSuccess: () => {
                setShowConfirm(false);
                onClose();
                toast.success('Venta anulada correctamente');
            },
            onError: () => {
                setShowConfirm(false);
                onClose();
                toast.error('Error al anular la venta');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Componente de Ticket Oculto para Reimpresión */}
            <div className="hidden">
                <Ticket ref={ticketRef} sale={sale} />
            </div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Detalle de Venta</h3>
                        <p className="text-xs text-slate-500 font-mono">{sale.nro_comprobante}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cliente</p>
                            <p className="text-sm font-bold text-slate-700 truncate">{sale.cliente?.nombre || 'General'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vendedor</p>
                            <p className="text-sm font-bold text-slate-700 truncate">{sale.user?.name}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</p>
                            <p className="text-sm font-bold text-slate-700">{new Date(sale.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pago</p>
                            <p className="text-sm font-bold text-indigo-600">{sale.metodo_pago}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                <tr>
                                    <th className="p-3">Producto</th>
                                    <th className="p-3 text-center">Cant.</th>
                                    <th className="p-3 text-right">P. Unit</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sale.detalles.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-medium text-slate-700">{item.producto.nombre}</td>
                                        <td className="p-3 text-center font-bold text-slate-600">{item.cantidad}</td>
                                        <td className="p-3 text-right text-slate-600">S/ {parseFloat(item.precio_unitario).toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-slate-800">S/ {parseFloat(item.subtotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-indigo-50/50">
                                <tr>
                                    <td colSpan="3" className="p-3 text-right font-bold text-slate-500 uppercase text-xs">Total</td>
                                    <td className="p-3 text-right font-black text-indigo-600 text-lg">S/ {parseFloat(sale.total).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button 
                        onClick={handlePrint}
                        className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-xl transition-all flex items-center gap-2 border border-indigo-200"
                    >
                        <Printer size={18} /> Re-imprimir Ticket
                    </button>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                        >
                            Cerrar
                        </button>
                        {sale.estado !== 'Anulado' && (
                            <button 
                                className="px-6 py-2 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                                onClick={() => setShowConfirm(true)}
                            >
                                Anular Venta
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-rose-50 rounded-full flex items-center justify-center">
                                <AlertTriangle size={32} className="text-rose-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Anular Venta</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Esta acción no se puede deshacer. El stock de todos los productos será devuelto automáticamente.
                            </p>
                            <p className="text-xs font-bold text-slate-400">
                                {sale.nro_comprobante} — S/ {parseFloat(sale.total).toFixed(2)}
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3">
                            <button 
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCancel}
                                className="flex-1 py-3 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                            >
                                Sí, Anular
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
