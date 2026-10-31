import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Sparkles, Check, Package, Zap } from 'lucide-react';

export default function CosmeticsStorefront({ onPurchaseSuccess }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [frequency, setFrequency] = useState('monthly');
  const [selectedAddons, setSelectedAddons] = useState([]);
  
  // Checkout form state
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [customerEmail, setCustomerEmail] = useState('priya.sharma@example.com');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    async function loadStoreProducts() {
      try {
        const res = await apiRequest('/products');
        setProducts(res);
        const mainBox = res.find(p => p.name.includes('Luxe Radiance')) || res[0];
        if (mainBox) {
          setSelectedProduct(mainBox);
          const odooVar = (mainBox.variants || []).find(v => v.attribute_value === 'Odoo');
          if (odooVar) {
            setSelectedVariantId(odooVar.id);
          } else if (mainBox.variants?.length > 0) {
            setSelectedVariantId(mainBox.variants[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadStoreProducts();
  }, []);

  const addOnProducts = products.filter(p => p.product_type === 'Add-on');

  const toggleAddon = (id) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  let basePrice = selectedProduct?.sales_price || 1200;
  let variantExtra = 0;
  if (selectedProduct && selectedVariantId) {
    const v = selectedProduct.variants.find(x => x.id === selectedVariantId);
    if (v) variantExtra = v.price_extra;
  }
  let addonsTotal = selectedAddons.reduce((acc, addonId) => {
    const item = addOnProducts.find(p => p.id === addonId);
    return acc + (item ? item.sales_price : 0);
  }, 0);

  let subtotal = (basePrice + variantExtra) + addonsTotal;
  let tax = Math.round(subtotal * 0.18 * 100) / 100;
  let grandTotal = Math.round((subtotal + tax) * 100) / 100;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      setOrderSuccess(null);
      const res = await apiRequest('/store/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          product_id: selectedProduct.id,
          variant_id: selectedVariantId,
          plan_frequency: frequency,
          quantity: 1,
          add_on_ids: selectedAddons,
          payment_method: paymentMethod
        })
      });
      setOrderSuccess(res);
      if (onPurchaseSuccess) {
        onPurchaseSuccess(res);
      }
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Cosmetics Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-950 via-[#2e050c] to-black border border-red-900/60 text-white p-8 sm:p-12 shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-red-400" />
            Odoo Cosmetics &bull; Luxury Skincare Subscription
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight leading-tight">
            Radiant, Organic Skincare Delivered to Your Doorstep.
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
            Fresh botanical serums and beauty routines billed effortlessly via the <strong>Odoo Recurring Engine</strong>.
          </p>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-6 bg-emerald-950/60 border border-emerald-600/80 rounded-2xl shadow-2xl text-emerald-300 flex items-start space-x-4">
          <div className="p-3 bg-emerald-900/80 rounded-xl">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-xs space-y-1 font-mono">
            <div className="text-base font-bold text-white font-serif">
              🎉 Thank you, {orderSuccess.customer}! Your Subscription is Active!
            </div>
            <div>Subscription Number: <strong className="text-emerald-400">{orderSuccess.subscription_number}</strong></div>
            <div>Invoice Issued: <strong className="text-emerald-400">{orderSuccess.invoice_number}</strong> (Paid ₹{orderSuccess.total_paid.toFixed(2)})</div>
            <div className="text-emerald-400 font-semibold pt-1">
              ⚡ The Admin Finance Dashboard MRR & Active Subscriptions have updated in real time!
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Customization (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box Selection & Variant */}
          <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-serif text-white font-medium flex items-center">
                <Package className="w-5 h-5 mr-2 text-red-500" />
                1. Choose Your Beauty Box & Brand Variant
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-full">
                Curated Monthly
              </span>
            </div>

            <div className="p-4 bg-black/40 border border-red-950/50 rounded-xl space-y-2">
              <div className="text-base font-serif font-bold text-white">
                {selectedProduct?.name || 'Luxe Radiance Serum Subscription Box'}
              </div>
              <p className="text-xs text-zinc-400">
                Includes Pure Vitamin-C Youth Serum, Botanical Hyaluronic Acid, and Gua Sha Rose Quartz Stone.
              </p>
              <div className="text-xl font-serif font-bold text-red-400">
                Base Price: ₹{basePrice.toFixed(2)}
              </div>
            </div>

            {/* Brand Variant Selector (Specific Problem Statement Requirement: Odoo adds 560!) */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono uppercase text-zinc-400 tracking-wider">
                Select Formula / Brand Variant:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                {selectedProduct?.variants?.map(v => {
                  const isSelected = selectedVariantId === v.id;
                  const isOdoo = v.attribute_value === 'Odoo';
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                        isSelected 
                          ? 'border-red-600 bg-red-950/40 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                          : 'border-red-950/60 bg-black/40 hover:border-red-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-white text-xs">{v.variant_name}</span>
                        {isOdoo && (
                          <span className="text-[9px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-bold">
                            ★ Premium
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-red-400 mt-2">
                        {v.price_extra > 0 ? `+₹${v.price_extra} / cycle` : 'Included in base'}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {isOdoo ? 'Certified Organic Odoo Botanical Blend' : 'Standard Laboratory Formula'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Delivery Frequency */}
          <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-serif text-white font-medium">
              2. Select Delivery Frequency (Subscription Plan)
            </h2>
            <div className="grid grid-cols-3 gap-3 font-mono">
              {[
                { id: 'weekly', label: 'Weekly Glam', desc: 'Every 7 days' },
                { id: 'monthly', label: 'Monthly Routine', desc: 'Most Popular', badge: '15% Off' },
                { id: 'yearly', label: 'Annual VIP Pass', desc: '12 Deliveries', badge: 'Best Value' },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={`p-4 rounded-xl border-2 text-center transition cursor-pointer ${
                    frequency === f.id
                      ? 'border-red-600 bg-red-950/40 shadow-[0_0_12px_rgba(220,38,38,0.25)]'
                      : 'border-red-950/60 bg-black/40 hover:border-red-800'
                  }`}
                >
                  <div className="font-bold text-xs text-white">{f.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-1">{f.desc}</div>
                  {f.badge && (
                    <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded-full">
                      {f.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Add-ons Switcher */}
          <div className="bg-black/50 backdrop-blur-xl border border-red-950/60 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-serif text-white font-medium">
              3. Customize With Skincare Add-ons (Switch On/Off)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {addOnProducts.map(addon => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 flex items-center justify-between transition ${
                      isChecked 
                        ? 'border-emerald-600 bg-emerald-950/30' 
                        : 'border-red-950/60 bg-black/40 hover:border-red-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{addon.name}</div>
                      <div className="text-xs text-emerald-400 font-semibold mt-0.5">+₹{addon.sales_price}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-700 bg-black/40'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Checkout Drawer (1 Col) */}
        <div className="bg-black/60 backdrop-blur-xl border border-red-950/60 rounded-2xl p-6 shadow-2xl h-fit space-y-5 sticky top-24 font-mono">
          <div className="border-b border-red-950/40 pb-3">
            <h2 className="text-lg font-serif font-bold text-white">Order Summary</h2>
            <span className="text-[10px] text-zinc-400">Recurring Subscription Checkout</span>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span className="truncate mr-2">{selectedProduct?.name || 'Beauty Box'}</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            {variantExtra > 0 && (
              <div className="flex justify-between text-red-300 font-semibold">
                <span>★ Odoo Organic Edition</span>
                <span>+₹{variantExtra.toFixed(2)}</span>
              </div>
            )}
            {addonsTotal > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Selected Skincare Add-ons</span>
                <span>+₹{addonsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500 pt-1">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Standard GST (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-red-950/40 font-serif">
              <span>Total Per {frequency.toUpperCase()}:</span>
              <span className="text-red-400">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-red-950/40 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Email (Account & Invoices)</label>
              <input
                type="email"
                required
                className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Payment Method</label>
              <select
                className="w-full bg-black/60 border border-red-950/60 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="UPI / GPay / PhonePe">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 text-xs"
            >
              <Zap className={`w-3.5 h-3.5 text-red-200 ${submitting ? 'animate-spin' : ''}`} />
              <span>{submitting ? 'Processing Subscription...' : `Subscribe Now (₹${grandTotal.toFixed(2)})`}</span>
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
