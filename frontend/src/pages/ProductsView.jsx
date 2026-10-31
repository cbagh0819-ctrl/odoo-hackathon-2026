import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Package, Plus, Tag, Check, Sparkles } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center">
            <Package className="w-6 h-6 mr-2 text-[#714B67]" />
            Products & Variants Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Per PDF: Set up products with name, type, sales price, cost price, and variants (e.g. choosing Odoo brand adds +₹560).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-[#714B67] hover:bg-[#5c3c54] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </button>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(prod => (
          <div key={prod.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                  {prod.product_type}
                </span>
                <span className="text-xs font-semibold text-slate-400">ID #{prod.id}</span>
              </div>

              <h2 className="text-base font-bold text-slate-800 mt-2">{prod.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{prod.notes || 'No notes provided.'}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Sales Price</span>
                  <span className="font-bold text-slate-800 text-sm">₹{prod.sales_price?.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Cost Price</span>
                  <span className="font-semibold text-slate-600">₹{prod.cost_price?.toFixed(2)}</span>
                </div>
              </div>

              {/* Variants Section */}
              {prod.variants && prod.variants.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center">
                    <Tag className="w-3 h-3 mr-1 text-[#714B67]" />
                    Available Variants:
                  </span>
                  <div className="space-y-1">
                    {prod.variants.map(v => (
                      <div key={v.id} className="text-xs bg-purple-50 text-purple-900 border border-purple-100 px-2.5 py-1 rounded flex justify-between items-center">
                        <span className="font-medium">{v.variant_name}</span>
                        <span className="font-bold text-[#714B67]">+₹{v.price_extra}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="text-emerald-600 flex items-center">
                <Check className="w-3 h-3 mr-1" /> Active in Catalog
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-xs space-y-4">
            <h2 className="text-base font-bold text-slate-800">Add New Product & Variant</h2>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Brightloop Accounting Plus"
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Type</label>
                  <select
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                    value={newProd.product_type}
                    onChange={e => setNewProd({ ...newProd, product_type: e.target.value })}
                  >
                    <option value="Software">Software</option>
                    <option value="Service">Service</option>
                    <option value="Add-on">Add-on</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Sales Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1500"
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
                    value={newProd.sales_price}
                    onChange={e => setNewProd({ ...newProd, sales_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="500"
                    className="w-full border border-slate-300 rounded p-2 text-xs"
                    value={newProd.cost_price}
                    onChange={e => setNewProd({ ...newProd, cost_price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Variant Extra (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-slate-300 rounded p-2 text-xs font-bold text-purple-700"
                    value={newProd.variants[0].price_extra}
                    onChange={e => {
                      const v = [...newProd.variants];
                      v[0].price_extra = e.target.value;
                      setNewProd({ ...newProd, variants: v });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Notes about availability, deployment, etc."
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  value={newProd.notes}
                  onChange={e => setNewProd({ ...newProd, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#714B67] text-white font-semibold rounded hover:bg-[#5c3c54]"
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
