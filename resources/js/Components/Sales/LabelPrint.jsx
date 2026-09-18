import JsBarcode from 'jsbarcode';
import React from 'react';

const LabelPrint = React.forwardRef(({ sale }, ref) => {
    const barcodeRef = React.useRef(null);

    React.useEffect(() => {
        if (barcodeRef.current && sale?.nro_comprobante) {
            try {
                JsBarcode(barcodeRef.current, sale.nro_comprobante, {
                    format: 'CODE128',
                    width: 1.5,
                    height: 40,
                    displayValue: true,
                    fontSize: 12,
                });
            } catch (e) {
                // ignorar errores de código de barras
            }
        }
    }, [sale]);

    if (!sale) return null;

    const fecha = sale.created_at
        ? new Date(sale.created_at).toLocaleString('es-PE', {
              timeZone: 'America/Lima',
          })
        : new Date().toLocaleString('es-PE');

    return (
        <div
            ref={ref}
            className="w-[200px] bg-white p-4 text-center font-mono text-[10px] text-black"
        >
            <p className="mb-2 border-b border-dashed border-black pb-2 text-[8px] font-bold uppercase tracking-wide">
                Etiqueta de Venta
            </p>
            <p className="text-sm font-black">{sale.nro_comprobante}</p>
            <p className="my-1">{fecha}</p>
            <div className="my-2 border-t border-dashed border-black"></div>
            <p className="text-left">
                <span className="font-bold">Cliente:</span>{' '}
                {sale.cliente?.nombre || 'Clientes Varios'}
            </p>
            <div className="my-2 border-t border-dashed border-black"></div>
            <table className="w-full text-left text-[8px]">
                <thead>
                    <tr className="border-b border-black">
                        <th>PRODUCTO</th>
                        <th className="text-center">CANT</th>
                        <th className="text-right">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.detalles?.slice(0, 8).map((item) => (
                        <tr key={item.id} className="border-b border-black/20">
                            <td className="max-w-[90px] truncate pr-1">
                                {item.producto?.nombre || ''}
                            </td>
                            <td className="text-center font-bold">
                                {item.cantidad}
                            </td>
                            <td className="text-right font-bold">
                                S/ {parseFloat(item.subtotal).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="my-2 border-t border-dashed border-black"></div>
            <p className="text-right text-sm font-black">
                Total: S/ {parseFloat(sale.total).toFixed(2)}
            </p>
            <div className="mt-3 flex justify-center">
                <svg ref={barcodeRef} />
            </div>
        </div>
    );
});

LabelPrint.displayName = 'LabelPrint';
export default LabelPrint;
