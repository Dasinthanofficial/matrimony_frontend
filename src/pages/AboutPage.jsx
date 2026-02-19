// ===== FIXED FILE: ./src/pages/AboutPage.jsx =====
// ✅ FIX: Removed 90 lines of dead commented code
import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';

const values = [
  { icon: Icons.Heart, title: 'Trust & Authenticity', desc: 'Every profile is verified to ensure genuine connections', gradient: 'from-rose-500 to-pink-600' },
  { icon: Icons.Shield, title: 'Privacy First', desc: 'Your personal data is encrypted and never shared', gradient: 'from-blue-500 to-cyan-600' },
  { icon: Icons.Lightbulb, title: 'Smart Innovation', desc: 'AI-powered matching for better compatibility', gradient: 'from-amber-500 to-orange-600' },
  { icon: Icons.Users, title: 'Community Focus', desc: 'Building meaningful relationships that last', gradient: 'from-emerald-500 to-teal-600' },
];

const timeline = [
  { year: '2023', title: 'Founded', desc: 'Started with a vision to revolutionize matchmaking', icon: Icons.Sparkles },
  { year: '2024', title: '5K Members', desc: 'Crossed 5,000 verified members across 50+ countries', icon: Icons.Users },
  { year: '2024', title: 'AI Matching', desc: 'Launched AI-powered compatibility engine', icon: Icons.Dna },
  { year: '2025', title: '10K+ Members', desc: 'Growing community with 5,000+ successful matches', icon: Icons.Heart },
];

const team = [
  { name: 'Building Trust', desc: 'Every profile goes through manual verification and ID checks before going live.', icon: Icons.BadgeCheck, color: 'text-blue-500 bg-blue-500/10' },
  { name: 'Smart Matching', desc: 'Our AI considers 50+ compatibility factors including values, lifestyle and goals.', icon: Icons.Dna, color: 'text-rose-500 bg-rose-500/10' },
  { name: 'Always Secure', desc: 'End-to-end encryption protects your conversations and personal information.', icon: Icons.Lock, color: 'text-emerald-500 bg-emerald-500/10' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <section className="relative pt-28 lg:pt-36 pb-16 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[var(--accent-500)]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-[var(--accent-700)]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative page-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-500)]/10 border border-[var(--accent-500)]/20 text-[var(--accent-500)] text-sm font-medium mb-6">
            <Icons.Info size={16} />
            <span>Our Story</span>
          </div>
          <h1 className="heading-xl mb-6">
            About <span className="text-gradient">Matrimony</span>
          </h1>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            We're on a mission to help people find meaningful, lasting relationships through technology and trust.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-10">
            {[
              { value: '10K+', label: 'Members', icon: Icons.Users },
              { value: '5K+', label: 'Matches', icon: Icons.Heart },
              { value: '195+', label: 'Countries', icon: Icons.Globe },
              { value: '98%', label: 'Satisfaction', icon: Icons.Star },
            ].map((stat, i) => {
              const Ico = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Ico size={18} className="text-[var(--accent-500)]" />
                  <div className="text-left">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-[var(--surface-glass)] border-y border-[var(--border-primary)]">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Icons.Zap size={14} />
                <span>Our Mission</span>
              </div>
              <h2 className="heading-lg mb-6">
                Connecting Hearts <span className="text-[var(--accent-500)]">Worldwide</span>
              </h2>
              <p className="text-[var(--text-secondary)] mb-4 leading-relaxed">
                Founded with a vision to revolutionize matchmaking, we combine traditional values with modern technology to create meaningful connections.
              </p>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                Our platform is built on authenticity, privacy, and compatibility. Every profile is verified, and our AI helps you find your perfect match based on what truly matters — shared values, goals, and lifestyle.
              </p>

              <div className="space-y-4">
                {team.map((item, i) => {
                  const Ico = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl card">
                      <div className={`flex-shrink-0 p-2.5 rounded-xl ${item.color}`}>
                        <Ico size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Icons.Star size={14} />
                <span>Our Values</span>
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-6">What We Stand For</h3>

              <div className="grid grid-cols-2 gap-4">
                {values.map((value, i) => {
                  const Ico = value.icon;
                  return (
                    <div key={i} className="card p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${value.gradient} text-white mb-4 shadow-lg shadow-black/10`}>
                        <Ico size={22} />
                      </div>
                      <h3 className="font-semibold mb-2 text-sm lg:text-base">{value.title}</h3>
                      <p className="text-xs lg:text-sm text-[var(--text-secondary)] leading-relaxed">{value.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Icons.Clock size={14} />
              <span>Our Journey</span>
            </div>
            <h2 className="heading-lg mb-4">
              How We <span className="text-[var(--accent-500)]">Got Here</span>
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-[var(--border-primary)] lg:-translate-x-px" />

            <div className="space-y-8 lg:space-y-12">
              {timeline.map((item, i) => {
                const Ico = item.icon;
                const isLeft = i % 2 === 0;
                return (
                  <div key={i} className={`relative flex items-start gap-6 lg:gap-0 ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                    <div className="absolute left-6 lg:left-1/2 w-3 h-3 rounded-full bg-[var(--accent-500)] border-2 border-[var(--bg-primary)] -translate-x-1.5 mt-5 z-10 shadow-sm shadow-[var(--accent-500)]/50" />
                    <div className="w-12 flex-shrink-0 lg:hidden" />
                    <div className={`card p-5 flex-1 lg:w-[calc(50%-2rem)] ${isLeft ? 'lg:mr-auto lg:pr-8' : 'lg:ml-auto lg:pl-8'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-[var(--accent-500)]/10 text-[var(--accent-500)]">
                          <Ico size={18} />
                        </div>
                        <span className="text-xs font-bold text-[var(--accent-500)] uppercase tracking-wider">{item.year}</span>
                      </div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                    </div>
                    <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24 pt-4">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden border border-[var(--accent-500)]/20 p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-500)]/15 to-[var(--accent-700)]/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-500)]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-700)]/10 rounded-full blur-[100px]" />

            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-[var(--accent-500)]/20 text-[var(--accent-500)] mb-6">
                <Icons.Heart size={32} />
              </div>
              <h2 className="heading-lg mb-4">
                Ready to Find Your <span className="text-[var(--accent-500)]">Match</span>?
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto mb-8">
                Join thousands of happy couples who found their life partners through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary btn-lg">
                  <Icons.Sparkles size={20} />
                  <span>Create Account</span>
                </Link>
                <Link to="/contact" className="btn-secondary btn-lg">
                  <Icons.Mail size={20} />
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}