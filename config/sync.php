<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sincronización Tienda Web (Receptor) <- POS (Emisor)
    |--------------------------------------------------------------------------
    |
    | Aqui la Tienda Web es el RECEPTOR. Desactiva "enabled" para que este
    | proyecto JAMAS emita webhooks (solo el POS lo hace).
    |
    | "enabled" = false → el modelo Producto no despacha SyncProductWebhookJob.
    |
    */

    'enabled' => (bool) env('SYNC_ENABLED', false),

    // URL del endpoint que recibe el POS (para loguear/verificar emisor).
    'webhook_url' => env('SYNC_WEBHOOK_URL'),

    // Bearer Token estatico que verifica el POS al enviar.
    'webhook_token' => env('SYNC_WEBHOOK_TOKEN'),

    // Secreto compartido para verificar la firma HMAC-SHA256 del payload.
    'webhook_secret' => env('SYNC_WEBHOOK_SECRET'),

    // Clave de cache del catálogo público en Redis.
    'catalog_cache_key' => 'catalog:list',
    'catalog_cache_ttl' => (int) env('CATALOG_CACHE_TTL', 300),
];
