import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

/* =========================================
   FEATURE DATA (Using Verified Safe Icons)
   ========================================= */

const coreValues = [
  { 
    icon: Icons.Shield, 
    title: 'Verified & Private', 
    desc: 'Manual moderation with NIC/Email/Phone checks. You control your data with per-field privacy (lock photos, hide income).', 
    gradient: 'from-blue-500 to-cyan-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]' 
  },
  { 
    icon: Icons.Sparkles, // Changed from Cpu to Sparkles (Safe)
    title: 'Smart AI Matching', 
    desc: 'Advanced filters for Religion, Caste, and Lifestyle combined with compatibility-based suggestions.', 
    gradient: 'from-violet-500 to-purple-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]' 
  },
  { 
    icon: Icons.Users, // Changed from Briefcase to Users (Safe)
    title: 'Agency Marketplace', 
    desc: 'Hire professional agencies to manage proposals. Agencies only charge success fees upon marriage.', 
    gradient: 'from-amber-500 to-orange-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
  },
  { 
    icon: Icons.Lock, // Changed from CreditCard to Lock (Safe)
    title: 'Secure Payments', 
    desc: 'Integrated with PayHere for secure Premium subscriptions and verified badge purchases.', 
    gradient: 'from-emerald-500 to-teal-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
  },
];

const platformFeatures = [
  { title: 'Trilingual Support', desc: 'Fully localized in English, Sinhala, and Tamil.', icon: Icons.Globe },
  { title: 'Real-time Chat', desc: 'Premium messaging with read receipts and updates.', icon: Icons.MessageCircle },
  { title: 'Shortlists & Notes', desc: 'Save favorites and add personal notes to profiles.', icon: Icons.Star }, // Changed from Bookmark
  { title: 'Dark Mode', desc: 'Modern UI with seamless Light/Dark theme switching.', icon: Icons.Settings }, // Changed from Moon
  { title: 'Profile Gauge', desc: 'Step-by-step builder to ensure 100% profile completion.', icon: Icons.BadgeCheck }, // Changed from UserCheck
  { title: 'Notification System', desc: 'Instant alerts for interests, matches, and messages.', icon: Icons.Mail }, // Changed from Bell
];

const timeline = [
  { year: '2023', title: 'Platform Launch', desc: 'Launched with core filtering, JWT security, and mobile-first design.', icon: Icons.Zap }, // Changed from Rocket
  { year: '2024', title: 'Agency Portal', desc: 'Introduced the Agency Marketplace allowing brokers to manage multiple profiles.', icon: Icons.Users }, // Changed from Briefcase
  { year: '2024', title: 'PayHere Integration', desc: 'Enabled secure local payments for Premium plans and Verified Badges.', icon: Icons.Lock }, // Changed from CreditCard
  { year: '2025', title: 'AI & Mobile App', desc: 'Rolling out AI-driven matching and native mobile notifications.', icon: Icons.Globe }, // Changed from Smartphone
];

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[var(--bg-primary)] selection:bg-[var(--accent-500)] selection:text-white">
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-28 sm:pt-36 lg:pt-48 pb-20 lg:pb-32 overflow-hidden w-full border-b border-[var(--border-primary)]">
        
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-[var(--bg-primary)] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1588096344392-421ebbd27f54?q=80&w=2070&auto=format&fit=crop" 
            alt="Sri Lankan Heritage" 
            className="w-full h-full object-cover opacity-[0.03] dark:opacity-[0.08] mix-blend-luminosity"
          />
        </div>

        {/* Hero Content */}
        <div className="relative page-container text-center z-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-glass)] border border-[var(--border-primary)] shadow-sm backdrop-blur-md mb-6 sm:mb-8 transition-transform hover:scale-105 cursor-default">
            <Icons.BadgeCheck size={16} className="text-[var(--accent-500)]" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Trusted & Secure</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 text-[var(--text-primary)] tracking-tight leading-[1.1] text-balance">
            The Next Generation of <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-400)] via-[var(--accent-500)] to-rose-400">
              Sri Lankan Matrimony
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed mb-12 sm:mb-16 font-medium text-pretty px-2">
            A secure, trilingual platform connecting families and agencies. Features AI matching, PayHere integration, and strict privacy controls for your peace of mind.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-5xl mx-auto">
            {[
              { value: 'Verified', label: 'NIC Checked', icon: Icons.BadgeCheck, color: 'text-blue-500' },
              { value: 'Secure', label: 'PayHere Payments', icon: Icons.Lock, color: 'text-emerald-500' },
              { value: 'Agencies', label: 'Professional Help', icon: Icons.Users, color: 'text-amber-500' },
              { value: '3 Langs', label: 'En / Si / Ta', icon: Icons.Globe, color: 'text-rose-500' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card p-5 sm:p-6 flex flex-col items-center justify-center text-center bg-[var(--surface-glass)] backdrop-blur-xl border border-[var(--border-primary)] shadow-lg rounded-2xl">
                  <div className={`p-3 rounded-xl bg-[var(--bg-secondary)] mb-3 shadow-inner border border-[var(--border-primary)] ${stat.color}`}>
                    {Icon && <Icon size={24} className="sm:w-6 sm:h-6" />}
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mb-1">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== CORE PILLARS ========== */}
      <section className="py-20 sm:py-32 relative px-4">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-[var(--text-primary)] tracking-tight">
              Platform <span className="text-[var(--accent-500)]">Essentials</span>
            </h2>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg">
              We combine traditional values with cutting-edge technology to create the safest matchmaking environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {coreValues.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className={`card p-6 sm:p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ring-1 ring-[var(--border-primary)] bg-[var(--surface-glass)] backdrop-blur-sm group overflow-hidden ${value.glow}`}>
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br ${value.gradient} text-white shadow-lg`}>
                      {Icon && <Icon size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)] mb-2 text-xl">{value.title}</h4>
                      <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== DETAILED FEATURES GRID ========== */}
      <section className="py-20 bg-[var(--bg-secondary)] border-y border-[var(--border-primary)]">
        <div className="page-container px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 ring-1 ring-[var(--accent-500)]/20">
            <Icons.Zap size={14} />
            <span>Powerful Features</span>
          </div>
          <h3 className="text-2xl sm:text-4xl font-extrabold mb-10 text-[var(--text-primary)]">Everything You Need</h3>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {platformFeatures.map((feat, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] hover:border-[var(--accent-500)]/40 transition-colors">
                {feat.icon && <feat.icon size={24} className="text-[var(--accent-500)] mb-3" />}
                <h4 className="font-bold text-[var(--text-primary)] mb-1">{feat.title}</h4>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TIMELINE SECTION ========== */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="page-container px-4 relative z-10">
          <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">Our Roadmap</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--accent-500)]/10 via-[var(--accent-500)]/40 to-transparent md:-translate-x-1/2 rounded-full" />

            <div className="space-y-12">
              {timeline.map((item, i) => {
                const isEven = i % 2 === 0;
                
                return (
                  <div key={i} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Dot */}
                    <div className="absolute left-[15px] md:left-1/2 w-7 h-7 rounded-full bg-[var(--accent-500)] ring-4 ring-[var(--bg-primary)] md:-translate-x-1/2 mt-1 z-10 flex items-center justify-center text-white">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                    
                    {/* Content */}
                    <div className={`w-full md:w-[calc(50%-3rem)] pl-16 md:pl-0 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                      <div className="flex items-center gap-2 mb-2 text-[var(--accent-500)] font-bold text-sm uppercase tracking-wider justify-start md:justify-[inherit]">
                        <span>{item.year}</span>
                      </div>
                      <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="pb-20 sm:pb-32 pt-12">
        <div className="page-container px-4">
          <div className="relative rounded-[2rem] overflow-hidden p-8 sm:p-16 text-center ring-1 ring-[var(--border-primary)] shadow-2xl bg-[var(--bg-secondary)]">
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 text-[var(--text-primary)]">
                Start Your <span className="text-gradient">Journey</span>
              </h2>
              
              <p className="text-base sm:text-lg text-[var(--text-secondary)] mb-10 px-2">
                Whether you are looking for a partner, or you are an agency helping others, we have the tools you need.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/register" className="w-full sm:w-auto btn-primary px-8 py-4 rounded-xl flex items-center justify-center bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] text-white shadow-lg">
                  <Icons.UserPlus size={20} className="mr-2" />
                  <span>Join as Member</span>
                </Link>
                
                <Link to="/contact" className="w-full sm:w-auto btn-secondary px-8 py-4 rounded-xl flex items-center justify-center bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)]">
                  <Icons.Users size={20} className="mr-2" />
                  <span>Agency Inquiry</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}