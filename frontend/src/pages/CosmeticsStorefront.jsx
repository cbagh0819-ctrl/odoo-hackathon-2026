import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { Sparkles, Check, Heart, Shield, Package, ArrowRight, Zap, RefreshCw } from 'lucide-react';

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
        // Find the main subscription box
        const mainBox = res.find(p => p.name.includes('Luxe Radiance')) || res[0];
        if (mainBox) {
          setSelectedProduct(mainBox);
          // Auto-select Odoo variant if available
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

  // Calculate live total
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
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-pink-900 via-[#714B67] to-purple-950 text-white p-8 sm:p-12 shadow-lg">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-pink-300" />
            Odoo Cosmetics &bull; Luxury Beauty Subscriptions
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Radiant, Organic Skincare Delivered to Your Doorstep.
          </h1>
          <p className="text-pink-100 text-sm sm:text-base leading-relaxed">
            Fresh botanical serums, peptide creams, and beauty routines customized for you.
            Billed effortlessly on subscription powered by <strong>Odoo Recurring Billing Engine</strong>.
          </p>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-400 rounded-xl shadow-md text-emerald-900 flex items-start space-x-4 animate-bounce-once">
          <div className="p-3 bg-emerald-200 rounded-full">
            <Check className="w-6 h-6 text-emerald-800" />
          </div>
          <div className="text-xs space-y-1">
            <div className="text-base font-bold text-emerald-900">
              🎉 Thank you, {orderSuccess.customer}! Your Subscription is Active!
            </div>
            <div>Subscription Number: <strong className="font-mono">{orderSuccess.subscription_number}</strong></div>
            <div>Invoice Issued: <strong className="font-mono">{orderSuccess.invoice_number}</strong> (Paid ₹{orderSuccess.total_paid.toFixed(2)})</div>
            <div className="text-emerald-700 font-semibold pt-1">
              ⚡ Notice: The Admin Finance Dashboard MRR & Active Subscriptions have updated in real time!
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Subscription Box Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Step 1 & 2: Customization (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Box Selection & Variant */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#714B67]" />
                1. Choose Your Beauty Box & Brand Variant
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-pink-100 text-pink-800 rounded-full">
                Curated Monthly
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-base font-bold text-slate-800">
                {selectedProduct?.name || 'Luxe Radiance Serum Subscription Box'}
              </div>
              <p className="text-xs text-slate-500">
                Includes Pure Vitamin-C Youth Serum, Botanical Hyaluronic Acid, and Gua Sha Rose Quartz Stone.
              </p>
              <div className="text-xl font-extrabold text-[#714B67]">
                Base Price: ₹{basePrice.toFixed(2)}
              </div>
            </div>

            {/* Brand Variant Selector (Specific Problem Statement Requirement: Odoo adds 560!) */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Formula / Brand Variant:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProduct?.variants?.map(v => {
                  const isSelected = selectedVariantId === v.id;
                  const isOdoo = v.attribute_value === 'Odoo';
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition ${
                        isSelected 
                          ? 'border-[#714B67] bg-purple-50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-xs">{v.variant_name}</span>
                        {isOdoo && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            ★ Premium
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold text-[#714B67] mt-2">
                        {v.price_extra > 0 ? `+₹${v.price_extra} / cycle` : 'Included in base'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {isOdoo ? 'Certified Organic Odoo Botanical Blend' : 'Standard Laboratory Formula'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Delivery Frequency */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              2. Select Delivery Frequency (Subscription Plan)
            </h2>
            <div className="grid grid-cols-3 gap-3">
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
                      ? 'border-[#714B67] bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800">{f.label}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{f.desc}</div>
                  {f.badge && (
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">
                      {f.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Add-ons Switcher */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              3. Customize With Skincare Add-ons (Switch On/Off)
            </h2>
            <p className="text-xs text-slate-500">
              Per PDF: Add-ons customers can switch on and off freely.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOnProducts.map(addon => {
                const isChecked = selectedAddons.includes(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border-2 flex items-center justify-between transition ${
                      isChecked 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{addon.name}</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">+₹{addon.sales_price}</div>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Step 3: Checkout Drawer (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md h-fit space-y-5 sticky top-24">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg font-bold text-slate-800">Order Summary</h2>
            <span className="text-xs text-slate-500">Recurring Subscription Checkout</span>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{selectedProduct?.name || 'Beauty Box'}</span>
              <span>₹{basePrice.toFixed(2)}</span>
            </div>
            {variantExtra > 0 && (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>★ Odoo Organic Edition Variant</span>
                <span>+₹{variantExtra.toFixed(2)}</span>
              </div>
            )}
            {addonsTotal > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Selected Skincare Add-ons</span>
                <span>+₹{addonsTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 pt-1">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Standard GST (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#714B67] pt-2 border-t border-slate-200">
              <span>Total Per {frequency.toUpperCase()}:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Customer Details Form */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-3 border-t border-slate-200 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                className="w-full border border-slate-300 rounded p-2 text-xs font-medium"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email (Account & Invoices)</label>
              <input
                type="email"
                required
                className="w-full border border-slate-300 rounded p-2 text-xs font-medium"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Payment Method</label>
              <select
                className="w-full border border-slate-300 rounded p-2 text-xs font-medium"
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
              className="w-full py-3 px-4 bg-[#714B67] hover:bg-[#5b3c53] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              <Zap className={`w-4 h-4 text-pink-300 ${submitting ? 'animate-spin' : ''}`} />
              <span>{submitting ? 'Processing Subscription...' : `Subscribe Now (₹${grandTotal.toFixed(2)})`}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-2">
              🔒 Instant activation &bull; Powered by Odoo Recurring Engine
            </p>
          </form>

        </div>

      </div>

    </div>
  );
}
