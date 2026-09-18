<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Tienda Web (Receptor). Recibe los Webhooks del POS:
 *
 *   POST /api/v1/sync/product
 *
 * Seguridad:
 *   1. Bearer Token estático (SYNC_WEBHOOK_TOKEN).
 *   2. Firma HMAC-SHA256 (hash_firma) verificada para garantizar integridad.
 *
 * Eficiencia:
 *   - Upsert por SKU (evita duplicados).
 *   - Limpia/actualiza de inmediato la clave de caché del catálogo en Redis.
 */
class ProductSyncController extends Controller
{
    /**
     * Verifica el Bearer Token estático configurado en el .env.
     */
    protected function tokenHasValidSignature(Request $request): bool
    {
        $expected = config('sync.webhook_token');
        if (empty($expected)) {
            return false;
        }
        $provided = $request->bearerToken();
        return is_string($provided) && hash_equals($expected, $provided);
    }

    /**
     * Verifica la firma HMAC-SHA256 del payload recibido.
     * El algoritmo debe coincidir con el ProductSyncService del POS.
     */
    protected function signatureIsValid(array $payload): bool
    {
        if (empty($payload['hash_firma'])) {
            return false;
        }

        $receiveHash = (string) $payload['hash_firma'];
        unset($payload['hash_firma'], $payload['action']);

        $canonical = collect($payload)->sortKeys()->toJson();
        $computed = hash_hmac('sha256', $canonical, (string) config('sync.webhook_secret'));

        return hash_equals($computed, $receiveHash);
    }

    public function sync(Request $request): JsonResponse
    {
        // 1) Autenticación: Bearer Token estático
        if (! $this->tokenHasValidSignature($request)) {
            Log::warning('[ProductSync] Token inválido.', ['ip' => $request->ip()]);
            return response()->json(['error' => 'No autorizado.'], 401);
        }

        $payload = $request->validate([
            'sku'            => 'required|string|max:50',
            'nombre'         => 'required|string|max:150',
            'descripcion'    => 'sometimes|nullable|string',
            'precio'         => 'required|numeric|min:0',
            'precio_compra'  => 'sometimes|nullable|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'stock_minimo'   => 'sometimes|nullable|integer|min:0',
            'categoria'      => 'sometimes|nullable|string|max:150',
            'categoria_padre'=> 'sometimes|nullable|string|max:150',
            'marca'          => 'sometimes|nullable|string|max:150',
            'unidad_medida'  => 'sometimes|nullable|string|max:50',
            'codigo_barras'  => 'sometimes|nullable|string|max:50',
            'imagen_url'     => 'sometimes|nullable|string',
            'video_url'      => 'sometimes|nullable|string',
            'mostrar_video'  => 'sometimes|boolean',
            'disponible'     => 'sometimes|boolean',
            'action'         => 'sometimes|in:create,update,delete',
            'hash_firma'     => 'required|string',
        ]);

        // 2) Integridad: firma HMAC
        if (! $this->signatureIsValid($payload)) {
            Log::warning('[ProductSync] Firma HMAC inválida para SKU: '.$payload['sku']);
            return response()->json(['error' => 'Firma inválida.'], 422);
        }

        try {
            $this->process($payload);
        } catch (\Throwable $e) {
            Log::error('[ProductSync] Error procesando SKU '.$payload['sku'].': '.$e->getMessage());
            return response()->json(['error' => 'Error interno.'], 500);
        }

        // 3) Limpiar/actualizar de inmediato la caché del catálogo en Redis.
        if (Cache::supportsTags()) {
            Cache::tags(['catalog', 'categories'])->flush();
        } else {
            Cache::flush();
        }

        return response()->json(['status' => 'ok', 'sku' => $payload['sku']], 200);
    }

    /**
     * Crea / actualiza / elimina el producto en la BD de la Web (PostgreSQL 2).
     */
    protected function process(array $payload): void
    {
        $action = $payload['action'] ?? 'update';

        if ($action === 'delete') {
            Producto::where('sku', $payload['sku'])->delete();
            return;
        }

        // Encontrar o crear la marca por nombre.
        $marcaId = null;
        if (! empty($payload['marca'])) {
            $marca = \App\Models\Marca::firstOrCreate(
                ['nombre' => $payload['marca']],
                ['estado' => 'Activo']
            );
            $marcaId = $marca->id;
        }

        // Encontrar o crear la categoría padre (si existe) para preservar la jerarquía.
        $categoriaId = null;
        if (! empty($payload['categoria'])) {
            $parentId = null;
            if (! empty($payload['categoria_padre'])) {
                $categoriaPadre = Categoria::firstOrCreate(
                    ['nombre' => $payload['categoria_padre']],
                    ['estado' => 'Activo']
                );
                $parentId = $categoriaPadre->id;
            }

            $categoria = Categoria::firstOrCreate(
                ['nombre' => $payload['categoria']],
                ['estado' => 'Activo', 'parent_id' => $parentId]
            );

            // Si la categoría existía sin padre pero ahora llega con padre, se corrige.
            if ($parentId && $categoria->parent_id !== $parentId) {
                $categoria->update(['parent_id' => $parentId]);
            }

            $categoriaId = $categoria->id;
        }

        $data = [
            'nombre'         => $payload['nombre'],
            'descripcion'    => $payload['descripcion'] ?? '',
            'precio_compra'  => (float) ($payload['precio_compra'] ?? 0),
            'precio_venta'   => (float) $payload['precio'],
            'stock'          => (int) $payload['stock'],
            'stock_minimo'   => (int) ($payload['stock_minimo'] ?? 0),
            'categoria_id'   => $categoriaId,
            'marca_id'       => $marcaId,
            'unidad_medida'  => $payload['unidad_medida'] ?? 'Unidad',
            'codigo_barras'  => $payload['codigo_barras'] ?? null,
            'imagen_url'     => $payload['imagen_url'] ?? null,
            'video_url'      => $payload['video_url'] ?? null,
            'mostrar_video'  => (bool) ($payload['mostrar_video'] ?? false),
            'estado'         => $payload['disponible'] ? 'Activo' : 'Inactivo',
        ];

        Producto::updateOrCreate(['sku' => $payload['sku']], $data);
    }
}
