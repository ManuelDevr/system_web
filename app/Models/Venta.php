<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venta extends Model
{
    use HasFactory;

    protected $fillable = [
        'total',
        'descuento',
        'base_imponible',
        'igv',
        'metodo_pago',
        'nro_comprobante',
        'estado',
        'sunat_envio',
        'user_id',
        'cliente_id',
    ];

    protected function casts(): array
    {
        return [
            'sunat_envio' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class);
    }
}
