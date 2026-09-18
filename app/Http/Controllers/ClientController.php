<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clientes = Cliente::select('id', 'nombre', 'ruc_dni', 'email', 'telefono', 'direccion', 'estado')
            ->orderBy('nombre')
            ->get();
            
        return Inertia::render('Clients/Index', [
            'clientes' => $clientes
        ]);
    }

    /**
     * Búsqueda AJAX de clientes para el POS (máx 15 resultados).
     * GET /clientes/search?q=termino
     */
    public function search(Request $request)
    {
        $q = $request->get('q', '');

        $clientes = Cliente::select('id', 'nombre', 'ruc_dni', 'telefono')
            ->where('estado', 'Activo')
            ->where(function ($query) use ($q) {
                $query->where('nombre', 'ilike', "%{$q}%")
                      ->orWhere('ruc_dni', 'ilike', "%{$q}%");
            })
            ->orderBy('nombre')
            ->limit(15)
            ->get();

        return response()->json($clientes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'ruc_dni' => 'nullable|string|max:20|unique:clientes,ruc_dni',
            'email' => 'nullable|email|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
        ]);

        Cliente::create($validated);

        return redirect()->back()->with('success', 'Cliente creado correctamente.');
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'ruc_dni' => 'nullable|string|max:20|unique:clientes,ruc_dni,' . $cliente->id,
            'email' => 'nullable|email|max:100',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string',
            'estado' => 'required|in:Activo,Inactivo',
        ]);

        $cliente->update($validated);

        return redirect()->back()->with('success', 'Cliente actualizado correctamente.');
    }

    public function toggleStatus(Cliente $cliente)
    {
        $cliente->estado = $cliente->estado === 'Activo' ? 'Inactivo' : 'Activo';
        $cliente->save();

        return redirect()->back()->with('success', 'Estado del cliente actualizado.');
    }
}
