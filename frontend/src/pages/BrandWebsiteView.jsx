import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Check, 
  Star, 
  Zap, 
  Layers, 
  Lock, 
  ChevronRight, 
  Flame, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function BrandWebsiteView({ onGoToLogin, onGoToStore }) {
  const [selectedPlan, setSelectedPlan] = useState('connoisseur');
  const [activeAccents, setActiveAccents] = useState('all');

  const fragrances = [
    {
      id: 1,
      name: "Oud Royal Noir",
      category: "Oriental Woody",
      notes: "Cambodian Agarwood, Smoked Amber, Taif Rose",
      priceMonthly: 4500,
      badge: "BESTSELLER",
      flaconVolume: "100ml Extrait",
      description: "A dark, hypnotic journey into nocturnal opulence, distilled in rare aged French oak barrels."
    },
    {
      id: 2,
      name: "Rose de Mai Sublime",
      category: "Floral Leather",
      notes: "May Rose of Grasse, Pink Pepper, White Suede",
      priceMonthly: 3800,
      badge: "LIMITED HARVEST",
      flaconVolume: "100ml EDP",
      description: "Hand-picked at dawn in Provence. An intoxicating balance of dewy petals and warm leather."
    },
    {
      id: 3,
      name: "Santal Impérial",
      category: "Woody Spicy",
      notes: "Mysore Sandalwood, Cardamom Pods, Florentine Iris",
      priceMonthly: 5200,
      badge: "PRIVATE RESERVE",
      flaconVolume: "100ml Extrait",
      description: "Creamy, majestic sacred woods elevated with rare crushed spices and powdery butter iris."
    },
    {
      id: 4,
      name: "Citrus Nobilis Reserve",
      category: "Fresh Aromatic",
      notes: "Calabrian Bergamot, Bitter Orange, Haitian Vetiver",
      priceMonthly: 3200,
      badge: "SUMMER ESSENCE",
      flaconVolume: "100ml Cologne Intense",
      description: "A burst of sun-drenched Italian orchards anchored by deep, smoky vetiver roots."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070305] text-zinc-100 font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. Global Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-red-900/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-10 right-1/4 w-[500px] h-[500px] bg-rose-950/20 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* 2. Public Header / Nav */}
      <header className="sticky top-0 z-50 bg-[#0a0406]/85 backdrop-blur-xl border-b border-red-900/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Brand Monogram */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/60 flex items-center justify-center font-serif font-bold text-xl text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              O
            </div>
            <div>
              <span className="font-serif font-bold text-lg tracking-tight text-white block">ODOO PERFUMES</span>
              <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase -mt-1 block">HAUTE PARFUMERIE SUITE</span>
            </div>
          </div>

          {/* Navigation Anchors */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
            <a href="#collections" className="hover:text-red-400 transition">Fragrance Catalog</a>
            <a href="#how-it-works" className="hover:text-red-400 transition">How It Works</a>
            <a href="#membership" className="hover:text-red-400 transition">Subscription Club</a>
            <a href="#security" className="hover:text-red-400 transition">Security & SLA</a>
          </nav>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToStore}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-red-400" />
              <span>Live Store</span>
            </button>

            <button
              onClick={onGoToLogin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-700 via-rose-600 to-red-700 hover:from-red-600 hover:to-rose-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-red-500/50 transition cursor-pointer"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        
        {/* Hackathon Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-red-950/70 border border-red-700/60 text-red-300 shadow-lg mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>ODOO x MAKE-A-TON 9.0 KOCHI HACKATHON 2026 EDITION</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Artisanal Fragrance<span className="text-red-500">.</span><br />
          <span className="italic text-zinc-300">Recurring Luxury.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The world's most coveted private reserve fragrances, delivered seamlessly to your door every month. Powered by zero-touch billing, automated idempotency, and certified sub-second ERP precision.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={onGoToStore}
            className="px-8 py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 shadow-[0_0_25px_rgba(220,38,38,0.4)] border border-red-500/60 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-red-300" />
            <span>Join The Perfume Club</span>
          </button>

          <button
            onClick={onGoToLogin}
            className="px-7 py-4 rounded-xl text-sm font-semibold text-zinc-200 bg-[#16070a] hover:bg-[#20090e] border border-red-800/60 transition flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-red-400" />
            <span>Access Workspace & ERP (1-Click)</span>
          </button>
        </div>

        {/* Hero Performance Badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-zinc-800/80">
          <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-red-400">12.8 ms</div>
            <div className="text-xs text-zinc-400 mt-1">Transaction Latency</div>
          </div>
          <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-emerald-400">100%</div>
            <div className="text-xs text-zinc-400 mt-1">Zero Double-Billing</div>
          </div>
          <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-white">v2.4</div>
            <div className="text-xs text-zinc-400 mt-1">Active WAF Shield</div>
          </div>
          <div className="p-4 bg-black/40 border border-zinc-800/80 rounded-2xl">
            <div className="text-2xl font-mono font-bold text-amber-400">1-Click</div>
            <div className="text-xs text-zinc-400 mt-1">Batch Billing Run</div>
          </div>
        </div>

      </section>

      {/* 4. Fragrance Catalog Section */}
      <section id="collections" className="py-20 px-6 max-w-7xl mx-auto border-t border-red-950/40">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-red-400 uppercase font-semibold">THE CURATED FLACONS</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-white mt-2">Private Reserve Fragrance Vault</h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-xl mx-auto">
            Each flacon is matured for twelve months in Grasse, France before bottling. Available exclusively through our recurring membership.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fragrances.map((f) => (
            <div 
              key={f.id}
              className="group p-6 rounded-2xl bg-gradient-to-b from-[#140608] to-[#0c0406] border border-red-900/40 hover:border-red-500/60 shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/60">
                    {f.badge}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">{f.flaconVolume}</span>
                </div>

                <div className="w-16 h-16 mx-auto my-6 rounded-2xl bg-gradient-to-br from-red-600/30 to-red-950 border border-red-500/50 flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(220,38,38,0.25)] group-hover:scale-110 transition duration-300">
                  🏺
                </div>

                <h3 className="text-lg font-serif font-bold text-white text-center">{f.name}</h3>
                <p className="text-xs text-red-400/90 text-center font-mono mt-1">{f.category}</p>
                
                <p className="text-xs text-zinc-400 mt-4 leading-relaxed text-center">
                  {f.description}
                </p>

                <div className="mt-4 pt-4 border-t border-zinc-800 text-[11px] text-zinc-500 space-y-1">
                  <span className="block font-semibold text-zinc-400">Notes Palette:</span>
                  <span className="block text-zinc-300 italic">{f.notes}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Subscription Price</span>
                  <span className="text-lg font-mono font-bold text-white">₹{f.priceMonthly.toLocaleString()}</span>
                  <span className="text-[10px] text-zinc-500"> /mo</span>
                </div>

                <button
                  onClick={onGoToStore}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-950 hover:bg-red-900 text-red-200 border border-red-700/60 transition flex items-center gap-1"
                >
                  <span>Select</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-red-950/40">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-red-400 uppercase font-semibold">THE RECURRING EXPERIENCE</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-white mt-2">Effortless Fragrance Cycles</h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-xl mx-auto">
            No friction, no manual orders. Pure recurring olfactory refinement orchestrated by our billing automation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0f0407] border border-zinc-800/80 relative">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-lg font-mono font-bold text-red-400 mb-6">
              01
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">Curate Your Profile</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Select your favorite notes (Oud, Amber, Rose, Sandalwood) and bespoke bottle sizes. Customize volume surcharges and delivery cadence.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0f0407] border border-red-800/50 shadow-[0_0_30px_rgba(220,38,38,0.15)] relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-950 border border-red-500/60 flex items-center justify-center text-lg font-mono font-bold text-white mb-6">
              02
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">Zero-Touch Billing Day</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our automated billing engine computes taxes (CGST/SGST), applies active coupon discounts, locks idempotency, and issues your verified tax invoice.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0f0407] border border-zinc-800/80 relative">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-lg font-mono font-bold text-red-400 mb-6">
              03
            </div>
            <h3 className="text-xl font-serif font-bold text-white mb-2">Doorstep Luxury & Portal Control</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Receive your bespoke flacon in luxury packaging. Log into your dedicated customer portal to swap scents, pause, or view your real PDF invoice.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Subscription Club Tiers */}
      <section id="membership" className="py-20 px-6 max-w-7xl mx-auto border-t border-red-950/40">
        <div className="text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-red-400 uppercase font-semibold">MEMBERSHIP TIERS</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-white mt-2">Choose Your Fragrance Plan</h2>
          <p className="text-sm text-zinc-400 mt-3 max-w-xl mx-auto">
            Cancel, pause, or swap scent profiles with zero penalty at any time through your portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl bg-[#0d0406] border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-semibold text-zinc-400 uppercase">TIER 1 • DISCOVERY</div>
              <h3 className="text-2xl font-serif font-bold text-white mt-2">Bespoke Discovery</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-mono font-bold text-white">₹1,800</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mt-4">Perfect for fragrance enthusiasts discovering niche scent notes.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3x 15ml Luxury Pocket Atomizers / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Full access to Customer Self-Service Portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Automated Monthly Invoicing with Real PDF</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGoToStore}
              className="mt-8 w-full py-3 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 transition"
            >
              Select Discovery
            </button>
          </div>

          {/* Plan 2 - Featured */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-[#1a070c] via-[#100407] to-[#0a0305] border-2 border-red-600/80 shadow-[0_0_35px_rgba(220,38,38,0.25)] flex flex-col justify-between relative scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white shadow-lg uppercase tracking-wider">
              MOST POPULAR
            </div>

            <div>
              <div className="text-xs font-mono font-semibold text-red-400 uppercase">TIER 2 • CONNOISSEUR</div>
              <h3 className="text-2xl font-serif font-bold text-white mt-2">Connoisseur Club</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-mono font-bold text-white">₹3,900</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mt-4">Our signature monthly flacon delivered with complimentary discovery vials.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-zinc-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" />
                  <span>1x Full 100ml Artisanal Flacon / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" />
                  <span>2x Rare Niche Sample Vials Included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" />
                  <span>Priority Fulfillment in Batch Runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-red-400" />
                  <span>Instant Scent Swaps in Customer Portal</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGoToStore}
              className="mt-8 w-full py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl border border-red-500/60 transition"
            >
              Join Connoisseur Club
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl bg-[#0d0406] border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-semibold text-zinc-400 uppercase">TIER 3 • IMPERIAL</div>
              <h3 className="text-2xl font-serif font-bold text-white mt-2">Royal Reserve</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-mono font-bold text-white">₹7,500</span>
                <span className="text-xs text-zinc-500">/ month</span>
              </div>
              <p className="text-xs text-zinc-400 mt-4">Ultra-rare Extrait concentrations for the discerning collector.</p>
              
              <ul className="mt-6 space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>1x 100ml Pure Extrait de Parfum (35% Oil)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Custom Monogrammed Crystal Bottle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated Personal Master Parfumeur</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGoToStore}
              className="mt-8 w-full py-3 rounded-xl text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 transition"
            >
              Select Royal Reserve
            </button>
          </div>

        </div>
      </section>

      {/* 7. Security & Architecture Credential Banner */}
      <section id="security" className="py-16 px-6 max-w-7xl mx-auto border-t border-red-950/40">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-red-950/30 via-[#120508] to-[#0a0305] border border-red-600/40 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ENTERPRISE WAF & ZERO DOUBLE-BILLING ENGINE ACTIVE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Built for Scale, Speed & Security
            </h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Every transaction executes in under 15 milliseconds, fortified with real-time deep packet inspection (SQLi, XSS, Path Traversal defense) and cryptographic hash verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-xl transition flex items-center gap-2"
            >
              <span>Explore Admin & Security Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 px-6 border-t border-zinc-900 bg-[#050203] text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-700 flex items-center justify-center font-serif font-bold text-white text-sm">
              O
            </div>
            <div>
              <span className="font-semibold text-zinc-300">Odoo Perfumes International</span>
              <span className="block text-[11px] text-zinc-600">Odoo x Make-A-Ton 9.0 Kochi Hackathon 2026</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-zinc-400">
            <span>Architect: <strong>Chandan Bagh</strong></span>
            <span>Backend: <strong>Deepak Dash</strong></span>
            <span>Frontend: <strong>Abhisek Nayak</strong></span>
            <span>QA Lead: <strong>Ankit Mandi</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLogin}
              className="text-xs text-red-400 hover:text-red-300 underline font-mono"
            >
              Sign In (ADMIN / MEMBER1)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
