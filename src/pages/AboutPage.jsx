import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

/* =========================================
   SRI LANKAN LOCALIZED DATA
   ========================================= */

const values = [
  { icon: Icons.BadgeCheck, title: 'NIC Verified Trust', desc: 'Every profile is strictly verified using Sri Lankan National IDs for genuine proposals.', gradient: 'from-blue-500 to-cyan-600', glow: 'hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]' },
  { icon: Icons.Shield, title: 'Family Privacy First', desc: 'We understand local sensitivities. Your photos and data are shared only with those you approve.', gradient: 'from-emerald-500 to-teal-600', glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' },
  { icon: Icons.Sparkles, title: 'Astrology & Tech', desc: 'Combining 20-Porondam matching with modern AI to ensure perfect cultural and personal compatibility.', gradient: 'from-amber-500 to-orange-600', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]' },
  { icon: Icons.Globe, title: 'Diaspora Connected', desc: 'Bridging the gap between Lankans back home and professionals in the UK, Australia, and beyond.', gradient: 'from-violet-500 to-purple-600', glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' },
];

const timeline = [
  { year: '2022', title: 'The Vision Begins', desc: 'Started in Colombo with a vision to modernize traditional Sri Lankan matchmaking.', icon: Icons.Lightbulb },
  { year: '2023', title: 'NIC Verification', desc: 'Pioneered mandatory ID checks, eliminating fake profiles and building trust.', icon: Icons.Shield }, // FIXED: Changed ShieldCheck to Shield
  { year: '2024', title: 'Porondam AI Launch', desc: 'Integrated automated astrological matching for Buddhist and Hindu families.', icon: Icons.Sparkles },
  { year: '2025', title: 'Global Lankan Network', desc: 'Crossed 100,000+ members, connecting local families with the global diaspora.', icon: Icons.Globe },
];

const teamPoints = [
  { title: 'Rooted in Tradition', desc: 'Built by Sri Lankans who understand the importance of family, caste, religion, and astrology in marriages.', icon: Icons.Heart, color: 'text-rose-500 bg-rose-500/10 ring-1 ring-rose-500/20' },
  { title: 'For All Communities', desc: 'A unified platform respecting Sinhalese, Tamil, Muslim, and Christian marriage customs.', icon: Icons.Users, color: 'text-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20' },
  { title: 'Always Secure', desc: 'End-to-end encryption and photo watermarking to protect our sisters and daughters online.', icon: Icons.Lock, color: 'text-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/20' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--bg-primary)] selection:bg-[var(--accent-500)] selection:text-white">
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-28 sm:pt-36 lg:pt-48 pb-20 lg:pb-32 overflow-hidden w-full border-b border-[var(--border-primary)]">
        
        {/* Subtle Cultural Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-[var(--bg-primary)] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1588096344392-421ebbd27f54?q=80&w=2070&auto=format&fit=crop" 
            alt="Sri Lankan Heritage" 
            className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.08] mix-blend-luminosity"
          />
        </div>

        {/* Glow Orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[var(--accent-500)]/10 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative page-container text-center z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-glass)] border border-[var(--border-primary)] shadow-sm backdrop-blur-md mb-6 sm:mb-8 transition-transform hover:scale-105 cursor-default">
            <Icons.Info size={16} className="text-[var(--accent-500)]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Our Story</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-[var(--text-primary)] tracking-tight leading-[1.1] text-balance">
            Modern Matchmaking, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-400)] via-[var(--accent-500)] to-rose-400">
              Sri Lankan Values
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed mb-12 sm:mb-16 font-medium text-pretty px-2">
            We're on a mission to help families find meaningful, lasting relationships by blending deep-rooted cultural traditions with modern, secure technology.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {[
              { value: '100K+', label: 'Verified Lankans', icon: Icons.Users, color: 'text-blue-500' },
              { value: '15K+', label: 'Happy Families', icon: Icons.Heart, color: 'text-rose-500' },
              { value: '100%', label: 'NIC Verified', icon: Icons.BadgeCheck, color: 'text-emerald-500' },
              { value: '4 Faiths', label: 'One Platform', icon: Icons.Globe, color: 'text-amber-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card p-5 sm:p-8 flex flex-col items-center justify-center text-center bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group active:scale-[0.98]">
                  <div className={`p-3 sm:p-4 rounded-2xl bg-[var(--bg-secondary)] mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner border border-[var(--border-primary)] ${stat.color}`}>
                    <Icon size={24} className="sm:w-8 sm:h-8" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tight">{stat.value}</p>
                  <p className="text-[9px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== MISSION & VALUES ========== */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="page-container px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Column: Mission */}
            <div className="space-y-8 lg:pr-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 ring-1 ring-emerald-500/20">
                  <Icons.Zap size={14} />
                  <span>Our Mission</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-[var(--text-primary)] leading-tight tracking-tight">
                  Connecting Sri Lankans <br className="hidden sm:block"/>
                  <span className="text-[var(--accent-500)]">Worldwide</span>
                </h2>
                <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed text-pretty font-medium">
                  We built this platform because finding a genuine partner who aligns with your family's expectations, religion, and astrology shouldn't be difficult or unsafe. We bring the trusted local marriage broker experience into the modern digital age.
                </p>
              </div>

              <div className="space-y-4">
                {teamPoints.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 transition-all duration-300 hover:shadow-lg group">
                      <div className={`flex-shrink-0 p-3.5 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1.5">{item.title}</h4>
                        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Values Grid */}
            <div className="bg-[var(--bg-secondary)]/50 p-6 sm:p-10 rounded-[2.5rem] ring-1 ring-[var(--border-primary)]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 ring-1 ring-violet-500/20">
                <Icons.Star size={14} />
                <span>Our Core Pillars</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold mb-8 text-[var(--text-primary)] tracking-tight">What We Stand For</h3>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {values.map((value, i) => {
                  const Icon = value.icon;
                  return (
                    <div key={i} className={`card p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ring-1 ring-[var(--border-primary)] bg-[var(--surface-glass)] backdrop-blur-sm active:scale-[0.98] overflow-hidden ${value.glow}`}>
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-primary)] to-transparent" />
                      
                      <div className={`inline-flex p-3.5 rounded-xl bg-gradient-to-br ${value.gradient} text-white mb-5 shadow-lg shadow-black/10`}>
                        <Icon size={22} />
                      </div>
                      <h4 className="font-bold text-[var(--text-primary)] mb-2.5 text-lg">{value.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{value.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== TIMELINE SECTION ========== */}
      <section className="py-20 sm:py-32 bg-[var(--surface-glass)]/20 border-y border-[var(--border-primary)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--accent-500)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="page-container px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 ring-1 ring-amber-500/20">
              <Icons.Clock size={14} />
              <span>Our Journey</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-[var(--text-primary)] tracking-tight">
              How We <span className="text-[var(--accent-500)]">Evolved</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line - Left aligned on mobile, center on md+ */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent-500)]/10 via-[var(--accent-500)]/40 to-transparent md:-translate-x-1/2 rounded-full" />

            <div className="space-y-12 sm:space-y-20">
              {timeline.map((item, i) => {
                const Icon = item.icon;
                const isEven = i % 2 === 0;
                
                return (
                  <div key={i} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* Glowing Center Dot */}
                    <div className="absolute left-[15px] md:left-1/2 w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] ring-4 ring-[var(--bg-primary)] md:-translate-x-1/2 mt-6 z-10 shadow-[0_0_15px_rgba(199,131,123,0.5)] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
                    </div>
                    
                    {/* Content Box */}
                    <div className={`w-full md:w-[calc(50%-3rem)] pl-20 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div className="card p-6 sm:p-8 hover:ring-[var(--accent-500)]/40 transition-all duration-300 group bg-[var(--surface-glass)] backdrop-blur-md shadow-xl hover:-translate-y-1">
                        <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          <div className="p-2.5 rounded-xl bg-[var(--accent-500)]/10 text-[var(--accent-500)] group-hover:scale-110 group-hover:bg-[var(--accent-500)] group-hover:text-white transition-all duration-300">
                            <Icon size={20} />
                          </div>
                          <span className="text-sm font-black text-[var(--accent-500)] tracking-widest">{item.year}</span>
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2.5 tracking-tight">{item.title}</h4>
                        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed text-pretty">{item.desc}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="pb-20 sm:pb-32 pt-12 sm:pt-20">
        <div className="page-container px-4">
          <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden p-8 sm:p-16 lg:p-24 text-center ring-1 ring-[var(--border-primary)] shadow-2xl bg-[var(--bg-secondary)]">
            
            {/* CTA Background Blurs */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)] to-[var(--bg-tertiary)] backdrop-blur-3xl" />
            <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[var(--accent-500)]/15 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--surface-glass)] ring-1 ring-[var(--border-primary)] text-[var(--accent-500)] mb-6 sm:mb-8 shadow-[0_0_30px_rgba(199,131,123,0.1)]">
                <Icons.Heart size={32} className="sm:w-14 sm:h-14 animate-pulse drop-shadow-md" />
              </div>
              
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 sm:mb-6 text-[var(--text-primary)] tracking-tight leading-tight text-balance">
                Ready to Find Your <span className="text-gradient">Match</span>?
              </h2>
              
              <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] mb-10 sm:mb-12 leading-relaxed px-2 font-medium text-pretty">
                Join thousands of Sri Lankan families who found trust, compatibility, and lifelong happiness through our platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full items-center">
                <Link to="/register" className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] rounded-2xl sm:rounded-full overflow-hidden shadow-[0_0_30px_rgba(199,131,123,0.3)] hover:shadow-[0_0_50px_rgba(199,131,123,0.5)] hover:scale-[1.02] active:scale-95 min-w-[240px]">
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <Icons.Sparkles size={20} className="mr-2" />
                  <span>Create Free Account</span>
                </Link>
                
                <Link to="/contact" className="w-full sm:w-auto btn-secondary text-base sm:text-lg py-4 sm:py-5 px-8 bg-[var(--surface-glass)] hover:bg-[var(--surface-glass-hover)] text-[var(--text-primary)] transition-all duration-300 min-w-[240px] flex justify-center items-center active:scale-95 rounded-2xl sm:rounded-full ring-1 ring-[var(--border-primary)]">
                  <Icons.Mail size={20} className="mr-2 text-[var(--text-muted)]" />
                  <span className="font-semibold">Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}