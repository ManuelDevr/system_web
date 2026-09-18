<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Pedido del Catálogo Web. Estructura preparada para el futuro carrito.
 * Hoy los clientes cotizan por WhatsApp; cuando WHATSAPP_CHECKOUT_ONLY=false
 * estos registros alimentarán el flujo de carrito/e-commerce.
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'shipping_address',
        'subtotal',
        'discount',
        'tax',
        'total',
        'currency',
        'status',
        'payment_method',
        'checkout_channel',
        'meta',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'discount' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'meta' => 'array',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
