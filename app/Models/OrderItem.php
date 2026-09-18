<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Línea de detalle de un pedido del Catálogo Web.
 */
class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'producto_id',
        'sku',
        'product_name',
        'unit_price',
        'quantity',
        'line_total',
    ];

    protected $casts = [
        'unit_price' => 'float',
        'quantity' => 'float',
        'line_total' => 'float',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
