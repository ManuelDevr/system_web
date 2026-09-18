<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tablas "orders" y "order_items" del Catálogo Web.
 *
 * Se crean ya preparadas (vaciías) para el futuro modelo de carrito / e-commerce
 * cuando WHATSAPP_CHECKOUT_ONLY pase a false. Hoy no se utilizan en el flujo
 * directo a WhatsApp, pero dejan lista la estructura.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 40)->unique();
            $table->string('customer_name', 150)->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->string('customer_email', 150)->nullable();
            $table->text('shipping_address')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('currency', 3)->default('PEN');
            $table->string('status', 30)->default('pending'); // pending|confirmed|paid|shipped|completed|cancelled
            $table->string('payment_method', 50)->nullable();
            $table->string('checkout_channel', 30)->default('whatsapp'); // whatsapp|online
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('producto_id')->nullable();
            $table->string('sku', 50)->nullable();
            $table->string('product_name', 150);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->decimal('quantity', 12, 2)->default(1);
            $table->decimal('line_total', 12, 2)->default(0);
            $table->timestamps();

            $table->index('producto_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
