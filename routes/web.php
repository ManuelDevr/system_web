<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SucursalController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\KardexController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\NotaCreditoController;
use App\Http\Controllers\CotizacionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PersonalController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ====== TIENDA PÚBLICA (sin login) ======
// Tienda Web ProLink Hardware
    $categoriaCacheBackend = \Illuminate\Support\Facades\Cache::supportsTags() ? \Illuminate\Support\Facades\Cache::tags(['categories']) : \Illuminate\Support\Facades\Cache::store();
    $categoriasConDestacado = static function () use ($categoriaCacheBackend) {
        return $categoriaCacheBackend->remember('catalog:categories', config('sync.catalog_cache_ttl', 300), static function () {
        $categorias = \App\Models\Categoria::select('id', 'nombre', 'parent_id')
            ->with('children:id,nombre,parent_id')
            ->whereNull('parent_id')
            ->orderBy('nombre')
            ->get();

        $categoriaIds = $categorias->flatMap(function ($categoria) {
            return $categoria->children->pluck('id')->push($categoria->id);
        })->unique()->values();

        $destacados = \App\Models\Producto::select('categoria_id', 'id', 'nombre', 'imagen_url', 'stock', 'unidad_medida')
            ->where('estado', 'Activo')
            ->whereIn('categoria_id', $categoriaIds)
            ->orderBy('id')
            ->get()
            ->groupBy('categoria_id');

        $categorias->each(function ($categoria) use ($destacados) {
            $categoria->children->each(function ($child) use ($destacados) {
                $productos = $destacados->get($child->id, collect())->take(5)->values();
                $child->setAttribute('productos', $productos);
                $child->setAttribute('destacado', $productos->first());
            });
            $productos = $destacados->get($categoria->id, collect())->take(5)->values();
            $categoria->setAttribute('productos', $productos);
            $categoria->setAttribute('destacado', $productos->first());
        });

            return $categorias;
        });
    };

    Route::get('/', function () use ($categoriasConDestacado) { 
        $categorias = $categoriasConDestacado();

        $racksCategoria = \App\Models\Categoria::where('nombre', 'Racks TV')->first();
        $racksProductos = collect();
        if ($racksCategoria) {
            $racksCategoriaIds = \App\Models\Categoria::where('parent_id', $racksCategoria->id)
                ->pluck('id')
                ->push($racksCategoria->id)
                ->values();
            $racksProductos = \App\Models\Producto::select('id', 'nombre', 'sku', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'categoria_id', 'imagen_url')
                ->with(['marca:id,nombre', 'categoria:id,nombre'])
                ->whereIn('categoria_id', $racksCategoriaIds)
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get();
        }

        $construccionCategoria = \App\Models\Categoria::where('nombre', 'Construccion')->first();
        $construccionProductos = collect();
        if ($construccionCategoria) {
            $construccionCategoriaIds = \App\Models\Categoria::where('parent_id', $construccionCategoria->id)
                ->pluck('id')
                ->push($construccionCategoria->id)
                ->values();
            $construccionProductos = \App\Models\Producto::select('id', 'nombre', 'sku', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'categoria_id', 'imagen_url')
                ->with(['marca:id,nombre', 'categoria:id,nombre'])
                ->whereIn('categoria_id', $construccionCategoriaIds)
                ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get();
        }

        $productos = \App\Models\Producto::select('id', 'nombre', 'sku', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'categoria_id', 'imagen_url')
            ->with(['marca:id,nombre', 'categoria:id,nombre'])
            ->where('estado', 'Activo')
            ->orderBy('nombre')
            ->take(8)
            ->get();
        return Inertia::render('Store/Index', [
            'categorias' => $categorias,
            'productos' => $productos,
            'racksCategoria' => $racksCategoria,
            'racksProductos' => $racksProductos,
            'construccionCategoria' => $construccionCategoria,
            'construccionProductos' => $construccionProductos,
        ]); 
    })->name('store.index');

    Route::get('/catalogo', function (\Illuminate\Http\Request $request) use ($categoriasConDestacado) { 
        $query = \App\Models\Producto::select('id', 'nombre', 'sku', 'codigo_barras', 'stock', 'precio_venta', 'tasa_descuento', 'unidad_medida', 'marca_id', 'categoria_id', 'imagen_url')
            ->with(['marca:id,nombre', 'categoria:id,nombre'])
            ->where('estado', 'Activo');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'ilike', "%{$search}%")
                  ->orWhere('sku', 'ilike', "%{$search}%")
                  ->orWhere('codigo_barras', 'ilike', "%{$search}%")
                  ->orWhere('descripcion', 'ilike', "%{$search}%");
            });
        }

        if ($attrs = $request->input('attrs', [])) {
            $values = collect($attrs)->flatten()->filter(function ($v) {
                return trim((string) $v) !== '';
            })->values();
            if ($values->isNotEmpty()) {
                $query->where(function ($q) use ($values) {
                    foreach ($values as $v) {
                        $q->where(function ($qq) use ($v) {
                            $qq->where('nombre', 'ilike', "%{$v}%")
                               ->orWhere('descripcion', 'ilike', "%{$v}%");
                        });
                    }
                });
            }
        }

        if ($category = $request->input('category')) {
            $categoryIds = [$category];
            $children = \App\Models\Categoria::where('parent_id', $category)->pluck('id')->toArray();
            $categoryIds = array_merge($categoryIds, $children);
            $query->whereIn('categoria_id', $categoryIds);
        }

        $relevantBrandIds = (clone $query)->pluck('marca_id')->unique()->filter()->values();
        $marcas = \App\Models\Marca::select('id', 'nombre')
            ->whereIn('id', $relevantBrandIds)
            ->orderBy('nombre')
            ->get();

        if ($brand = $request->input('brand')) {
            $query->where('marca_id', $brand);
        }

        $priceStats = (clone $query)->select([\Illuminate\Support\Facades\DB::raw('MIN(precio_venta) as min_price, MAX(precio_venta) as max_price')])->first();
        $priceRange = [
            'min' => $priceStats->min_price ? (float) $priceStats->min_price : 0,
            'max' => $priceStats->max_price ? (float) ceil($priceStats->max_price) : 2000,
        ];

        if ($minPrice = $request->input('min_price')) {
            $query->where('precio_venta', '>=', (float) $minPrice);
        }

        if ($maxPrice = $request->input('max_price')) {
            $query->where('precio_venta', '<=', (float) $maxPrice);
        }

        $sort = $request->input('sort');
        if ($sort === 'price_asc') {
            $query->orderBy('precio_venta');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('precio_venta', 'desc');
        } else {
            $query->orderBy('nombre');
        }

        $categorias = $categoriasConDestacado();

        // Caché en Redis (tags "catalog") para reducir lecturas a PostgreSQL 2.
        // El ProductSyncController invalida la etiqueta al recibir un Webhook.
        $cacheKey = 'catalog:' . md5(json_encode($request->only(['search', 'attrs', 'category', 'brand', 'min_price', 'max_price', 'sort', 'page'])));

        $cacheBackend = \Illuminate\Support\Facades\Cache::supportsTags() ? \Illuminate\Support\Facades\Cache::tags(['catalog']) : \Illuminate\Support\Facades\Cache::store();

        list($productos, $marcasCache, $priceRangeCache) = $cacheBackend
            ->remember($cacheKey, config('sync.catalog_cache_ttl', 300), function () use ($query, $marcas, $priceRange) {
                return [
                    $query->paginate(12)->withQueryString(),
                    $marcas->toArray(),
                    $priceRange,
                ];
            });

        return Inertia::render('Store/Catalog', [
            'productos' => $productos,
            'categorias' => $categorias,
            'marcas' => collect($marcasCache),
            'priceRange' => $priceRangeCache,
        ]); 
    })->name('store.catalog');

    Route::get('/buscar', function (\Illuminate\Http\Request $request) {
        $q = trim((string) $request->input('q'));
        if (mb_strlen($q) < 1) {
            return response()->json([]);
        }
        $productos = \App\Models\Producto::select('id', 'nombre', 'sku', 'stock', 'precio_venta', 'unidad_medida', 'marca_id', 'imagen_url')
            ->with(['marca:id,nombre'])
            ->where('estado', 'Activo')
            ->where(function ($query) use ($q) {
                $query->where('nombre', 'ilike', "%{$q}%")
                      ->orWhere('sku', 'ilike', "%{$q}%")
                      ->orWhere('codigo_barras', 'ilike', "%{$q}%");
            })
            ->limit(6)
            ->get();
        return response()->json($productos);
    })->name('store.search');

    $legalContent = function (string $tipo) use ($categoriasConDestacado) {
        $categorias = $categoriasConDestacado();
        return Inertia::render('Store/Legal', [
            'tipo' => $tipo,
            'categorias' => $categorias,
        ]);
    };

    Route::get('/privacidad', function () use ($legalContent) {
        return $legalContent('privacidad');
    })->name('store.privacidad');

    Route::get('/terminos', function () use ($legalContent) {
        return $legalContent('terminos');
    })->name('store.terminos');

    Route::get('/aviso-legal', function () use ($legalContent) {
        return $legalContent('aviso-legal');
    })->name('store.aviso-legal');

    Route::get('/producto/{producto}', function (\App\Models\Producto $producto) use ($categoriasConDestacado) {
        $producto->load(['categoria:id,nombre,parent_id', 'categoria.parent:id,nombre', 'marca:id,nombre', 'conversiones.unidad:id,nombre,abreviatura']);
        $similares = \App\Models\Producto::select('id', 'nombre', 'sku', 'stock', 'precio_venta', 'tasa_descuento', 'unidad_medida', 'marca_id', 'categoria_id', 'imagen_url')
            ->with(['marca:id,nombre'])
            ->where('categoria_id', $producto->categoria_id)
            ->where('id', '!=', $producto->id)
            ->where('estado', 'Activo')
            ->limit(4)
            ->get();
        $categorias = $categoriasConDestacado();
        return Inertia::render('Store/Detail', [
            'producto' => $producto,
            'similares' => $similares,
            'categorias' => $categorias
        ]);
    })->name('store.detail');

Route::middleware(['auth'])->group(function () {
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:ver_dashboard')
        ->name('dashboard');
    
    // POS / Ventas Rápidas
    Route::get('/venta-rapida', [SaleController::class, 'checkout'])
        ->middleware('permission:realizar_ventas')
        ->name('venta-rapida');

    Route::post('/ventas', [SaleController::class, 'store'])
        ->middleware('permission:realizar_ventas')
        ->name('ventas.store');

    // Historial de Ventas
    Route::get('/mis-ventas', [SaleController::class, 'index'])
        ->middleware('permission:ver_historial_ventas')
        ->name('mis-ventas');
    
    Route::get('/gestion-ventas', [SaleController::class, 'index'])
        ->middleware('permission:ver_historial_ventas')
        ->name('gestion-ventas');

    Route::patch('/ventas/{venta}/cancel', [SaleController::class, 'cancel'])
        ->middleware('permission:anular_ventas')
        ->name('ventas.cancel');

    // Catálogo
    Route::get('/catalogo-productos', [ProductController::class, 'catalog'])
        ->middleware('permission:ver_catalogo')
        ->name('catalogo-productos');

    Route::get('/producto/{producto}/{slug?}', [ProductController::class, 'show'])
        ->middleware('permission:ver_catalogo')
        ->name('productos.show');

    // Kardex
    Route::get('/inventario/kardex', [KardexController::class, 'index'])
        ->middleware('permission:ver_kardex')
        ->name('kardex.index');

    // Mantenimiento de Inventario
    Route::get('/inventario/mantenimiento', [InventoryController::class, 'maintenance'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.maintenance');

    // Ajustes de Inventario
    Route::get('/inventario/ajustes', [InventoryController::class, 'adjustments'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.adjustments');
    Route::post('/inventario/ajustes', [InventoryController::class, 'storeAdjustment'])
        ->middleware('permission:gestionar_mantenimiento')
        ->name('inventory.adjustments.store');

    // Clientes
    Route::get('/gestion-clientes', [ClientController::class, 'index'])
        ->middleware('permission:gestionar_clientes')
        ->name('gestion-clientes');
    Route::get('/clientes/search', [ClientController::class, 'search'])->middleware('permission:realizar_ventas')->name('clientes.search');
    Route::post('/clientes', [ClientController::class, 'store'])->middleware('permission:gestionar_clientes')->name('clientes.store');
    Route::put('/clientes/{cliente}', [ClientController::class, 'update'])->middleware('permission:gestionar_clientes')->name('clientes.update');
    Route::patch('/clientes/{cliente}/toggle', [ClientController::class, 'toggleStatus'])->middleware('permission:gestionar_clientes')->name('clientes.toggle');

    // --- RUTAS DE ADMINISTRACIÓN ---
    Route::middleware(['admin'])->group(function () {

        // Contabilidad y Reportes SIRE
        Route::get('/reportes/rvie', [ReportController::class, 'rvie'])->middleware('permission:ver_reporte_rvie')->name('reportes.rvie');
        Route::get('/reportes/rvie/export', [ReportController::class, 'exportRvie'])->middleware('permission:ver_reporte_rvie')->name('reportes.rvie.export');
        Route::get('/reportes/rce', [ReportController::class, 'rce'])->middleware('permission:ver_reporte_rce')->name('reportes.rce');
        Route::get('/reportes/rce/export', [ReportController::class, 'exportRce'])->middleware('permission:ver_reporte_rce')->name('reportes.rce.export');
        
        // Proveedores
        Route::get('/proveedores', [ProveedorController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.index');
        Route::post('/proveedores', [ProveedorController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.store');
        Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.update');
        Route::patch('/proveedores/{proveedor}/toggle', [ProveedorController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('proveedores.toggle');

        // Notas de Crédito
        Route::get('/notas-credito', [NotaCreditoController::class, 'index'])->middleware('permission:ver_historial_ventas')->name('notas-credito.index');
        Route::get('/notas-credito/nueva', [NotaCreditoController::class, 'create'])->middleware('permission:anular_ventas')->name('notas-credito.create');
        Route::post('/notas-credito', [NotaCreditoController::class, 'store'])->middleware('permission:anular_ventas')->name('notas-credito.store');

        // Cotizaciones / Proformas
        Route::get('/cotizaciones', [CotizacionController::class, 'index'])->middleware('permission:gestionar_productos')->name('cotizaciones.index');
        Route::get('/cotizaciones/nueva', [CotizacionController::class, 'create'])->middleware('permission:gestionar_productos')->name('cotizaciones.create');
        Route::post('/cotizaciones', [CotizacionController::class, 'store'])->middleware('permission:gestionar_productos')->name('cotizaciones.store');
        Route::post('/cotizaciones/{cotizacion}/convert', [CotizacionController::class, 'convert'])->middleware('permission:realizar_ventas')->name('cotizaciones.convert');

        // Compras
        Route::get('/compras', [CompraController::class, 'index'])->middleware('permission:gestionar_productos')->name('compras.index');
        Route::get('/compras/nueva', [CompraController::class, 'create'])->middleware('permission:gestionar_productos')->name('compras.create');
        Route::post('/compras', [CompraController::class, 'store'])->middleware('permission:gestionar_productos')->name('compras.store');

        // Productos e Inventario
        Route::get('/gestion-productos', [ProductController::class, 'index'])->middleware('permission:gestionar_productos')->name('gestion-productos');
        Route::post('/productos', [ProductController::class, 'store'])->middleware('permission:gestionar_productos')->name('productos.store');
        Route::put('/productos/{producto}', [ProductController::class, 'update'])->middleware('permission:gestionar_productos')->name('productos.update');
        Route::patch('/productos/{producto}/toggle', [ProductController::class, 'toggleStatus'])->middleware('permission:gestionar_productos')->name('productos.toggle');
        Route::delete('/productos/{producto}/imagen', [ProductController::class, 'destroyImage'])->middleware('permission:gestionar_productos')->name('productos.imagen.destroy');
        Route::post('/productos/{producto}/conversiones', [ProductController::class, 'storeConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.store');
        Route::put('/conversiones/{conversion}', [ProductController::class, 'updateConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.update');
        Route::patch('/conversiones/{conversion}/toggle', [ProductController::class, 'toggleStatusConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.toggle');
        Route::delete('/conversiones/{conversion}', [ProductController::class, 'destroyConversion'])->middleware('permission:gestionar_productos')->name('productos.conversiones.destroy');
        Route::post('/productos/importar-excel', [ProductController::class, 'importExcel'])->middleware('permission:gestionar_productos')->name('productos.import-excel');
        Route::get('/productos/plantilla-excel', [ProductController::class, 'downloadSampleExcel'])->middleware('permission:gestionar_productos')->name('productos.sample-excel');

        // Mantenimiento
        Route::get('/marcas', [BrandController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('marcas.index');
        Route::post('/marcas', [BrandController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('marcas.store');
        Route::put('/marcas/{marca}', [BrandController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('marcas.update');
        Route::patch('/marcas/{marca}/toggle', [BrandController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('marcas.toggle');
        Route::get('/categorias', [CategoryController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('categorias.index');
        Route::post('/categorias', [CategoryController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('categorias.store');
        Route::put('/categorias/{categoria}', [CategoryController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('categorias.update');
        Route::patch('/categorias/{categoria}/toggle', [CategoryController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('categorias.toggle');
        Route::get('/unidades', [UnitController::class, 'index'])->middleware('permission:gestionar_mantenimiento')->name('unidades.index');
        Route::post('/unidades', [UnitController::class, 'store'])->middleware('permission:gestionar_mantenimiento')->name('unidades.store');
        Route::put('/unidades/{unidad}', [UnitController::class, 'update'])->middleware('permission:gestionar_mantenimiento')->name('unidades.update');
        Route::patch('/unidades/{unidad}/toggle', [UnitController::class, 'toggleStatus'])->middleware('permission:gestionar_mantenimiento')->name('unidades.toggle');

        // Grupo de Personal
        Route::get('/grupo-personal', [PersonalController::class, 'grupos'])->middleware('permission:gestionar_usuarios')->name('grupo-personal.index');
        Route::put('/grupos/{grupo}', [PersonalController::class, 'update'])->middleware('permission:gestionar_usuarios')->name('grupos.update');
        Route::patch('/grupos/{grupo}/toggle', [PersonalController::class, 'toggleStatus'])->middleware('permission:gestionar_usuarios')->name('grupos.toggle');
        // Horarios
        Route::get('/horarios', function () { return Inertia\Inertia::render('Personal/Horarios'); })->middleware('permission:gestionar_usuarios')->name('horarios.index');

        // Usuarios
        Route::get('/gestion-usuarios', [UserController::class, 'index'])->middleware('permission:gestionar_usuarios')->name('gestion-usuarios');
        Route::post('/usuarios', [UserController::class, 'store'])->middleware('permission:gestionar_usuarios')->name('usuarios.store');
        Route::put('/usuarios/{user}', [UserController::class, 'update'])->middleware('permission:gestionar_usuarios')->name('usuarios.update');
        Route::patch('/usuarios/{user}/toggle', [UserController::class, 'toggleStatus'])->middleware('permission:gestionar_usuarios')->name('usuarios.toggle');
        
        // Configuración y Privilegios
        Route::get('/configuracion', [SettingController::class, 'index'])->middleware('permission:configuracion_sistema')->name('configuracion');
        Route::post('/configuracion', [SettingController::class, 'update'])->middleware('permission:configuracion_sistema')->name('configuracion.update');
        Route::get('/sucursales', [SucursalController::class, 'index'])->middleware('permission:gestionar_sucursales')->name('sucursales.index');
        Route::post('/sucursales', [SucursalController::class, 'store'])->middleware('permission:gestionar_sucursales')->name('sucursales.store');
        Route::put('/sucursales/{sucursal}', [SucursalController::class, 'update'])->middleware('permission:gestionar_sucursales')->name('sucursales.update');
        Route::patch('/sucursales/{sucursal}/toggle', [SucursalController::class, 'toggle'])->middleware('permission:gestionar_sucursales')->name('sucursales.toggle');
        Route::delete('/sucursales/{sucursal}', [SucursalController::class, 'destroy'])->middleware('permission:gestionar_sucursales')->name('sucursales.destroy');
        
        Route::get('/configuracion/privilegios', [PermissionController::class, 'index'])->middleware('permission:configurar_privilegios')->name('privilegios.index');
        Route::post('/configuracion/privilegios', [PermissionController::class, 'update'])->middleware('permission:configurar_privilegios')->name('privilegios.update');
    });

    // Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


// Redirecciones de compatibilidad: URLs publicas viejas /tienda-web* hacia las nuevas rutas raiz.
Route::redirect('/tienda-web', '/', 301);
Route::redirect('/tienda-web/catalogo', '/catalogo', 301);
Route::redirect('/tienda-web/buscar', '/buscar', 301);
Route::redirect('/tienda-web/producto/{producto}', '/producto/{producto}', 301);

require __DIR__.'/auth.php';
