<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use App\Models\ConversionUnidadProducto;
use App\Models\Unidad;
use App\Models\Configuracion;
use App\Http\Requests\StoreSaleRequest;
use App\Services\KardexService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render('Sales/Index', [
            'ventas' => Venta::select('id', 'total', 'metodo_pago', 'nro_comprobante', 'estado', 'user_id', 'cliente_id', 'created_at')
                ->with([
                    'cliente:id,nombre', 
                    'user:id,name', 
                    'detalles.producto:id,nombre'
                ])
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    public function checkout()
    {
        $serie = 'B001';
        $lastNro = Venta::where('nro_comprobante', 'LIKE', $serie . '-%')
            ->orderByRaw("CAST(SUBSTR(nro_comprobante, " . (strlen($serie) + 2) . ") AS INTEGER) DESC")
            ->value('nro_comprobante');
        $nextNum = $lastNro ? ((int) substr($lastNro, strlen($serie) + 1)) + 1 : 1;

        $config = Configuracion::first();

        return Inertia::render('Sales/Checkout', [
            'serie' => $serie,
            'numero' => str_pad($nextNum, 6, '0', STR_PAD_LEFT),
            'igv' => (float) ($config?->igv ?? 18.00),
            'metodos_pago' => $config?->metodos_pago ?? ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'BCP'],
            'productos' => Producto::select('id', 'nombre', 'sku', 'codigo_barras', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'imagen_url')
                ->with(['marca:id,nombre', 'conversiones.unidad:id,nombre,abreviatura'])
                ->where('estado', 'Activo')
                ->get(),
        ]);
    }

    public function store(StoreSaleRequest $request)
    {
        try {
            DB::beginTransaction();

            $totalBackend = 0;
            $itemsData = [];
            $productosProcesados = [];
            $cantidadesRequeridas = [];

            foreach ($request->items as $item) {
                $productId = $item['producto_id'];

                if (!isset($productosProcesados[$productId])) {
                    $producto = Producto::lockForUpdate()->find($productId);
                    if (!$producto || $producto->estado !== 'Activo') {
                        throw new \Exception("El producto seleccionado no está disponible o está inactivo.");
                    }
                    $productosProcesados[$productId] = $producto;
                    $cantidadesRequeridas[$productId] = 0;
                }

                $producto = $productosProcesados[$productId];
                
                $factor = 1;
                $precioReal = (float)$producto->precio_venta;
                $unidadBaseSunat = 'NIU';

                // Buscar unidad y su mapeo SUNAT
                $unidad = Unidad::where('nombre', $producto->unidad_medida)->first();
                if ($unidad) {
                    $unidadBaseSunat = $unidad->sunat_code;
                }

                if (isset($item['conversion_id']) && $item['conversion_id']) {
                    $conv = ConversionUnidadProducto::with('unidad')->find($item['conversion_id']);
                    if ($conv) {
                        $factor = $conv->factor;
                        $precioReal = (float)$conv->precio_venta;
                        $unidadBaseSunat = $conv->unidad->sunat_code;
                    }
                }

                $cantidadBase = $item['cantidad'] * $factor;
                $cantidadesRequeridas[$productId] += $cantidadBase;

                if ($producto->stock < $cantidadesRequeridas[$productId]) {
                    throw new \Exception("Stock insuficiente para: " . $producto->nombre);
                }

                $subtotalReal = $item['cantidad'] * $precioReal;
                $descuentoItem = round((float) ($item['descuento'] ?? 0), 2);
                $subtotalDescuento = round(max($subtotalReal - $descuentoItem, 0), 2);
                $totalBackend += $subtotalDescuento;

                $itemsData[] = [
                    'producto_id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $precioReal,
                    'subtotal' => $subtotalReal,
                    'descuento' => $descuentoItem,
                    'subtotal_descuento' => $subtotalDescuento,
                    'unidad_id' => $item['unidad_id'] ?? ($unidad ? $unidad->id : null),
                    'unidad_sunat' => $unidadBaseSunat,
                    'cantidad_base' => $cantidadBase,
                    'producto_model' => $producto
                ];
            }

            // Número de comprobante secuencial en formato SUNAT (B001-000001)
            // lockForUpdate ya está activo en los productos; usamos el max para garantizar secuencialidad.
            $serie = 'B001';
            $lastNro = Venta::lockForUpdate()
                ->where('nro_comprobante', 'LIKE', $serie . '-%')
                ->orderByRaw("CAST(SUBSTR(nro_comprobante, " . (strlen($serie) + 2) . ") AS INTEGER) DESC")
                ->value('nro_comprobante');

            $nextNum = $lastNro ? ((int) substr($lastNro, strlen($serie) + 1)) + 1 : 1;
            $nro_comprobante = $serie . '-' . str_pad($nextNum, 6, '0', STR_PAD_LEFT);

            $igvRate = (float) (Configuracion::first()?->igv ?? 18.00);
            $baseImponible = round($totalBackend / (1 + $igvRate / 100), 2);
            $igvAmount = round($totalBackend - $baseImponible, 2);

            $venta = Venta::create([
                'total' => $totalBackend,
                'descuento' => round((float) $request->descuento ?? 0, 2),
                'base_imponible' => $baseImponible,
                'igv' => $igvAmount,
                'metodo_pago' => $request->metodo_pago,
                'user_id' => auth()->id(),
                'cliente_id' => $request->cliente_id,
                'nro_comprobante' => $nro_comprobante,
            ]);

            foreach ($itemsData as $data) {
                DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $data['producto_id'],
                    'cantidad' => $data['cantidad'],
                    'precio_unitario' => $data['precio_unitario'],
                    'subtotal' => $data['subtotal'],
                    'descuento' => $data['descuento'],
                    'subtotal_descuento' => $data['subtotal_descuento'],
                    'unidad_id' => $data['unidad_id'],
                    'cantidad_base' => $data['cantidad_base']
                ]);

                // Registrar en Kardex y actualizar stock
                KardexService::registrarMovimiento(
                    $data['producto_model'],
                    'SALIDA',
                    $data['cantidad_base'],
                    'Venta: ' . $nro_comprobante,
                    'Venta',
                    $venta->id
                );
            }

            // Preparar Payload para Facturación (Simulado)
            $config = Configuracion::first();
            $invoicePayload = [
                'emisor' => [
                    'ruc' => $config->ruc ?? '00000000000',
                    'razon_social' => $config->nombre_empresa ?? 'Ferreteria CMA',
                ],
                'venta' => [
                    'nro' => $nro_comprobante,
                    'total' => $totalBackend,
                    'moneda' => 'PEN',
                    'formato' => 'ticket_80mm', // Requerimiento específico
                ],
                'items' => array_map(fn($i) => [
                    'descripcion' => $i['nombre'],
                    'cantidad' => $i['cantidad'],
                    'unidad' => $i['unidad_sunat'],
                    'p_unitario' => $i['precio_unitario'],
                    'total' => $i['subtotal']
                ], $itemsData)
            ];

            DB::commit();

            return redirect()->back()->with([
                'success' => 'Venta realizada y stock actualizado en Kardex.',
                'last_sale_id' => $venta->id,
                'invoice_payload' => $invoicePayload // Para que el front lo envíe a la API si fuera necesario
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function cancel(Venta $venta)
    {
        if ($venta->estado === 'Anulado') {
            return redirect()->back()->withErrors(['error' => 'La venta ya está anulada.']);
        }

        try {
            DB::beginTransaction();

            foreach ($venta->detalles as $detalle) {
                // withTrashed: recupera el producto aunque haya sido eliminado (SoftDeletes)
                $producto = Producto::withTrashed()->lockForUpdate()->find($detalle->producto_id);

                if (!$producto) {
                    // Producto no encontrado ni en trash: registrar warning y continuar
                    \Illuminate\Support\Facades\Log::warning("Anulación venta {$venta->nro_comprobante}: producto ID {$detalle->producto_id} no encontrado.");
                    continue;
                }
                
                // Devolver stock vía Kardex
                KardexService::registrarMovimiento(
                    $producto,
                    'ENTRADA',
                    $detalle->cantidad_base,
                    'Anulación Venta: ' . $venta->nro_comprobante,
                    'Venta',
                    $venta->id
                );
            }

            $venta->estado = 'Anulado';
            $venta->save();

            DB::commit();
            return redirect()->back()->with('success', 'Venta anulada y stock retornado al Kardex.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'No se pudo anular la venta.']);
        }
    }
}
