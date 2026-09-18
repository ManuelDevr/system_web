import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { Search, LayoutGrid, List, Package, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/Components/Products/ProductCard';
import { productRoute } from '@/Utils/slugify';
import { FaWhatsapp } from 'react-icons/fa';

export default function Catalog({ productos, categorias, marcas }) {
  const { config, webConfig = {} } = usePage().props;
  const whatsappPhone = webConfig.whatsapp_phone;
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('');

  const searchTimeout = useRef(null);

  const productosData = productos.data || [];
  const currentPage = productos.current_page || 1;
  const lastPage = productos.last_page || 1;
  const total = productos.total || 0;

  const fetchProducts = (params = {}) => {
    const query = {};
    if (params.search ?? searchTerm) query.search = params.search ?? searchTerm;
    if (params.category ?? selectedCategory) query.category = params.category ?? selectedCategory;
    if (params.brand ?? selectedBrand) query.brand = params.brand ?? selectedBrand;
    if (params.sort ?? sortBy) query.sort = params.sort ?? sortBy;
    if (params.page) query.page = params.page;

    router.get(route('catalogo-productos'), query, {
      preserveState: true,
      replace: true,
    });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts({ search: value, page: 1 });
    }, 400);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setSelectedBrand('');
    fetchProducts({ category: value, brand: '', page: 1 });
  };

  const handleBrandChange = (value) => {
    setSelectedBrand(value);
    fetchProducts({ brand: value, page: 1 });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    fetchProducts({ sort: value, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage) return;
    fetchProducts({ page });
  };

  // React a los params de la URL al montar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const category = params.get('category') || '';
    const brand = params.get('brand') || '';
    const sort = params.get('sort') || '';
    if (search) setSearchTerm(search);
    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
    if (sort) setSortBy(sort);
  }, []);

  const handleWhatsApp = (product) => {
    if (!whatsappPhone) return;
    const text = `Hola, me interesa este producto:\n*${product.nombre}*`;
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderPagination = () => {
    if (lastPage <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(lastPage, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-bold">
            {total} producto(s) — Pág. {currentPage} de {lastPage}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  p === currentPage
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout>
      <Head title="Catálogo de Productos" />

      <div className="space-y-6">
        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-0 rounded-2xl text-sm font-bold shadow-inner"
                    placeholder="Buscar por nombre, SKU o código..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-0 rounded-2xl text-sm font-bold text-slate-700 shadow-inner appearance-none"
                    >
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => (
                            <React.Fragment key={cat.id}>
                                <option value={cat.id} className="font-bold">{cat.nombre}</option>
                                {cat.children.map(sub => (
                                    <option key={sub.id} value={sub.id}>
                                        &nbsp;&nbsp;&nbsp;{sub.nombre}
                                    </option>
                                ))}
                            </React.Fragment>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 min-w-[180px]">
                    <select
                        value={selectedBrand}
                        onChange={(e) => handleBrandChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-0 rounded-2xl text-sm font-bold text-slate-700 shadow-inner appearance-none"
                    >
                        <option value="">Todas las marcas</option>
                        {marcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 min-w-[160px]">
                    <select
                        value={sortBy}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border-transparent focus:border-indigo-500 focus:ring-0 rounded-2xl text-sm font-bold text-slate-700 shadow-inner appearance-none"
                    >
                        <option value="">Ordenar por</option>
                        <option value="price_asc">Precio: Menor a Mayor</option>
                        <option value="price_desc">Precio: Mayor a Menor</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button 
                      onClick={() => setViewMode('grid')} 
                      className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')} 
                      className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                      title="Vista Lista"
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
            </div>
        </div>

        {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productosData.length > 0 ? productosData.map((product) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAdd={() => handleWhatsApp(product)}
                        onView={() => router.get(productRoute(route, product))}
                    />
                )) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <Package size={48} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron productos</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="p-4">Producto</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4 text-center">Stock</th>
                                <th className="p-4 text-right">Precio</th>
                                <th className="p-4 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {productosData.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center text-slate-300">
                                                {product.imagen_url ? (
                                                  <img src={product.imagen_url} alt={product.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                  <Package size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{product.nombre}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{product.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                                            {product.categoria?.nombre || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-600 text-sm">
                                        {parseInt(product.stock, 10)} {product.unidad_medida}
                                    </td>
                                    <td className="p-4 text-right font-black text-slate-800">
                                        S/ {parseFloat(product.precio_venta).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <button 
                                              onClick={() => router.get(productRoute(route, product))}
                                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                              title="Ver detalle"
                                          >
                                              <Eye size={16} />
                                          </button>
                                          <button 
                                              onClick={() => handleWhatsApp(product)}
                                              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#1faf57] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5"
                                              title="Atención por WhatsApp"
                                          >
                                              <FaWhatsapp size={13} />
                                              Atención
                                          </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {renderPagination()}
      </div>
    </AuthenticatedLayout>
  );
}
