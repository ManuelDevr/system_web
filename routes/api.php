<?php

use App\Http\Controllers\Api\ProductSyncController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API de la Tienda Web (Receptor de sincronización del POS)
|--------------------------------------------------------------------------
|
| Estas rutas NO llevan sesión web (sin cookies). El POS las autentica
| mediante Bearer Token estático + firma HMAC.
|
| Ruta:   POST /api/v1/sync/product
| Uso:    El POS envia el payload estandar al crear/editar/eliminar un producto
|         o al cambiar su stock.
|
*/

Route::prefix('v1')->group(function () {
    Route::post('/sync/product', [ProductSyncController::class, 'sync'])
        ->name('api.sync.product');
});
