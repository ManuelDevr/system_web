<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Configuración del Catálogo / Tienda Web
    |--------------------------------------------------------------------------
    |
    | Bandera de funcionalidad para elegir el flujo de checkout:
    |   - WHATSAPP_CHECKOUT_ONLY=true  → boton/CTA directo a WhatsApp (cotización).
    |   - WHATSAPP_CHECKOUT_ONLY=false → permite construir el carrito/e-commerce futuro.
    |
    */

    // Número de WhatsApp del dueño (formato internacional SIN "+" ni espacios).
    'whatsapp_phone' => env('WHATSAPP_PHONE'),

    // Mensaje por defecto al abrir el chat.
    'whatsapp_message' => env('WHATSAPP_MESSAGE', 'Hola, me interesa este producto'),

    // Flujo de compra.
    'enable_online_payment' => (bool) env('ENABLE_ONLINE_PAYMENT', false),
    'enable_direct_cart'    => (bool) env('ENABLE_DIRECT_CART', false),
    'whatsapp_checkout_only' => (bool) env('WHATSAPP_CHECKOUT_ONLY', true),
];
