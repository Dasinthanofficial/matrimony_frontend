import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

const features = [
  {
    icon: Icons.Dna,
    title: 'AI-Powered Matching',
    desc: 'Smart algorithms analyze compatibility factors to find your ideal partner',
    gradient: 'from-rose-500 to-pink-600',
    glow: 'group-hover:shadow-rose-500/20',
  },
  {
    icon: Icons.Shield,
    title: 'Privacy Protected',
    desc: 'End-to-end encryption and strict verification keep your data safe',
    gradient: 'from-blue-500 to-cyan-600',
    glow: 'group-hover:shadow-blue-500/20',
  },
  {
    icon: Icons.BadgeCheck,
    title: 'Verified Profiles',
    desc: 'Every profile is manually verified to ensure authentic connections',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'group-hover:shadow-emerald-500/20',
  },
  {
    icon: Icons.Globe,
    title: 'Global Community',
    desc: 'Connect with members from 195+ countries around the world',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'group-hover:shadow-violet-500/20',
  },
];

const stats = [
  { value: '10K+', label: 'Active Members', icon: Icons.Users, color: 'text-rose-500 bg-rose-500/10' },
  { value: '5K+', label: 'Successful Matches', icon: Icons.Heart, color: 'text-emerald-500 bg-emerald-500/10' },
  { value: '98%', label: 'Satisfaction Rate', icon: Icons.Star, color: 'text-amber-500 bg-amber-500/10' },
  { value: '24/7', label: 'Support Available', icon: Icons.MessageCircle, color: 'text-blue-500 bg-blue-500/10' },
];

const steps = [
  {
    step: '01',
    title: 'Create Profile',
    desc: 'Sign up and create your detailed profile with photos and preferences',
    icon: Icons.UserPlus,
  },
  {
    step: '02',
    title: 'Get Matched',
    desc: 'Our AI analyzes compatibility to suggest the best matches for you',
    icon: Icons.Heart,
  },
  {
    step: '03',
    title: 'Connect',
    desc: 'Start conversations, build connections, and find your life partner',
    icon: Icons.MessageCircle,
  },
];

const testimonials = [
  {
    name: 'Priya & Rahul',
    text: 'We found each other on this platform and got married within a year. The matching algorithm really works!',
    color: 'from-rose-500 to-pink-600',
  },
  {
    name: 'Anita & Vikram',
    text: 'The verified profiles gave us confidence. We are now happily engaged!',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Meera & Arjun',
    text: 'Best matrimony platform we have used. The interface is beautiful and easy to use.',
    color: 'from-amber-500 to-orange-600',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* ========== HERO ========== */}
      <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden">
        {/* Background blurs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[400px] lg:w-[600px] h-[400px] lg:h-[600px] bg-[var(--accent-500)]/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-[var(--accent-700)]/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative page-container">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Trusted by 10,000+ members</span>
            </div>

            {/* Heading */}
            <h1 className="heading-xl mb-6">
              Find Your{' '}
              <span className="text-gradient">Perfect Match</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--text-secondary)]"> Begin Your Journey Today</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience premium matchmaking where meaningful connections are made.
              Join thousands who found their life partners through our trusted platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="group btn-primary btn-lg"
              >
                <Icons.Sparkles size={20} />
                <span>Start Your Journey</span>
                <Icons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/pricing')}
                className="btn-secondary btn-lg"
              >
                <Icons.Crown size={20} className="text-amber-500" />
                <span>View Premium Plans</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-12 text-sm text-[var(--text-muted)]">
              {[
                { icon: Icons.Shield, text: '100% Secure', color: 'text-emerald-500' },
                { icon: Icons.BadgeCheck, text: 'Verified Profiles', color: 'text-blue-500' },
                { icon: Icons.Lock, text: 'Privacy Protected', color: 'text-violet-500' },
              ].map((item, i) => {
                const Ico = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Ico size={16} className={item.color} />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="py-16 border-y border-[var(--border-primary)] bg-[var(--surface-glass)]">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => {
              const Ico = stat.icon;
              return (
                <div key={i} className="text-center">
                  <div className={`inline-flex p-3 rounded-2xl ${stat.color} mb-4`}>
                    <Ico size={24} />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)]">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-16 lg:py-24">
        <div className="page-container">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-xs font-semibold uppercase tracking-wider mb-4">
              <Icons.Zap size={14} />
              <span>Why Choose Us</span>
            </div>
            <h2 className="heading-lg mb-4">
              Features That Make Us{' '}
              <span className="text-[var(--accent-500)]">Different</span>
            </h2>
            <p className="text-[var(--text-secondary)]">
              Our platform combines traditional values with modern technology to create
              the perfect matchmaking experience.
            </p>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature, i) => {
              const Ico = feature.icon;
              return (
                <div
                  key={i}
                  className={`group card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${feature.glow}`}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg shadow-black/10`}
                  >
                    <Ico size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-16 lg:py-24 bg-[var(--surface-glass)] border-y border-[var(--border-primary)]">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Icons.Lightbulb size={14} />
              <span>How It Works</span>
            </div>
            <h2 className="heading-lg mb-4">
              Three Simple Steps to{' '}
              <span className="text-[var(--accent-500)]">Find Love</span>
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Connector line — desktop only, single horizontal bar */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-[var(--accent-500)]/40 via-[var(--accent-500)]/20 to-[var(--accent-500)]/40" />

            <div className="grid md:grid-cols-3 gap-10 md:gap-8">
              {steps.map((item, i) => {
                const Ico = item.icon;
                return (
                  <div key={i} className="relative text-center">
                    <div className="relative inline-flex mb-6">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center text-white shadow-lg shadow-[var(--accent-500)]/25">
                        <Ico size={32} />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--bg-primary)] border-2 border-[var(--accent-500)] text-[var(--accent-500)] text-sm font-bold flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="py-16 lg:py-24">
        <div className="page-container">
          <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Icons.Star size={14} />
              <span>Success Stories</span>
            </div>
            <h2 className="heading-lg mb-4">
              Real Stories, Real{' '}
              <span className="text-[var(--accent-500)]">Connections</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Icons.Star key={j} size={16} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-semibold text-sm`}
                  >
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-medium text-sm">{testimonial.name}</span>
                    <p className="text-[10px] text-[var(--text-muted)]">Verified Couple</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="pb-16 lg:pb-24 pt-4">
        <div className="page-container">
          <div className="relative rounded-3xl overflow-hidden border border-[var(--accent-500)]/20 p-8 sm:p-12 lg:p-16 text-center">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-500)]/15 to-[var(--accent-700)]/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-500)]/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent-700)]/10 rounded-full blur-[100px]" />

            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-[var(--accent-500)]/20 text-[var(--accent-500)] mb-6">
                <Icons.Heart size={32} />
              </div>
              <h2 className="heading-lg mb-4">
                Your Perfect Match is{' '}
                <span className="text-[var(--accent-500)]">Waiting</span>
              </h2>
              <p className="text-[var(--text-secondary)] max-w-lg mx-auto mb-8">
                Don't wait any longer. Join thousands of happy couples who found their
                life partners through our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary btn-lg"
                >
                  <Icons.Sparkles size={20} />
                  <span>Create Free Account</span>
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="btn-secondary btn-lg"
                >
                  <Icons.Info size={20} />
                  <span>Learn More</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}