import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Package, Plus, Tag, Check } from 'lucide-react';

export default function ProductsView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newProd, setNewProd] = useState({
    name: '',
    product_type: 'Software',
    sales_price: '',
    cost_price: '',
    notes: '',
    variants: [
      { variant_name: 'Brand: Odoo Enterprise Edition', attribute_name: 'Brand', attribute_value: 'Odoo', price_extra: 560 }
    ]
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/products');
      setProducts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify({
          ...newProd,
          sales_price: Number(newProd.sales_price),
          cost_price: Number(newProd.cost_price),
          variants: newProd.variants.map(v => ({
            ...v,
            price_extra: Number(v.price_extra)
          }))
        })
      });
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(`Error creating product: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/50 backdrop-blur-xl border border-red-950/60 p-6 rounded-2xl shadow-2xl">
        <div>
          <div className="tracking-[0.3em] text-[10px] font-mono text-zinc-400 uppercase mb-1">
            CATALOG REPOSITORY
          </div>
          <h1 className="text-2xl font-serif text-white font-medium flex items-center">
            <Package className="w-5 h-5 mr-2.5 text-red-500" />
            Products & Variants Catalog
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Per PDF: Products with sales/cost prices and variants (e.g. Odoo brand variant adds +₹560).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs font-semibold rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.25)] transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </button>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(prod => (
          <div key={prod.id} className="bg-black/50 backdrop-blur-xl border border-red-950/60 hover:border-red-700/60 transition-all rounded-2xl p-6 shadow-2xl flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-red-950/60 text-red-300 border border-red-900/50 rounded">
                  {prod.product_type}
                </span>
                <span className="text-xs font-mono text-zinc-500">#{prod.id}</span>
              </div>

              <h2 className="text-base font-serif font-bold text-white mt-3 group-hover:text-red-200 transition">
                {prod.name}
              </h2>
              <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">
                {prod.notes || 'No notes specified.'}
              </p>

              <div className="mt-4 pt-3 border-t border-red-950/40 flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-zinc-500 block text-[10px]">SALES PRICE</span>
                  <span className="font-bold text-white text-sm">₹{prod.sales_price?.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-500 block text-[10px]">COST PRICE</span>
                  <span className="font-semibold text-zinc-400">₹{prod.cost_price?.toFixed(2)}</span>
                </div>
              </div>

              {/* Variants Section */}
              {prod.variants && prod.variants.length > 0 && (
                <div className="mt-4 pt-3 border-t border-red-950/40">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block mb-2 flex items-center">
                    <Tag className="w-3 h-3 mr-1 text-red-400" />
                    Configured Variants:
                  </span>
                  <div className="space-y-1.5">
                    {prod.variants.map(v => (
                      <div key={v.id} className="text-xs font-mono bg-red-950/30 text-red-200 border border-red-900/40 px-3 py-1.5 rounded-lg flex justify-between items-center">
                        <span className="truncate mr-2">{v.variant_name}</span>
                        <span className="font-bold text-red-400 flex-shrink-0">+₹{v.price_extra}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-red-950/40 text-[11px] font-mono text-emerald-400 flex items-center justify-between">
              <span className="flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Active in Platform
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0305] border border-red-900/60 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs space-y-4 font-mono">
            <h2 className="text-base font-serif font-bold text-white">Add New Product & Variant</h2>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Suite"
                  className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Type</label>
                  <select
                    className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                    value={newProd.product_type}
                    onChange={e => setNewProd({ ...newProd, product_type: e.target.value })}
                  >
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                    <option value="Beauty Box">Beauty Box</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-600"
                    value={newProd.sales_price}
                    onChange={e => setNewProd({ ...newProd, sales_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                    value={newProd.cost_price}
                    onChange={e => setNewProd({ ...newProd, cost_price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Variant Price Extra (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs font-bold text-red-400 focus:outline-none focus:border-red-600"
                    value={newProd.variants[0].price_extra}
                    onChange={e => {
                      const v = [...newProd.variants];
                      v[0].price_extra = e.target.value;
                      setNewProd({ ...newProd, variants: v });
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-red-950/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
