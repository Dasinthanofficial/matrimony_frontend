import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import hindu from '../assets/Hindu.png';
import christian from '../assets/Christian.png';
import muslim from '../assets/Muslim.png';
import buddhist from '../assets/Buddhist.png';
import { Icons } from '../components/Icons';

/* =========================================
   CONSTANTS & DATA
   ========================================= */

const heroImages = [hindu, christian, muslim, buddhist];

const features = [
  { 
    icon: Icons.Sparkles, 
    title: 'Horoscope Check', 
    desc: 'Easily match Porondam (Grahacharaya). Essential for Buddhist and Hindu marriage proposals.', 
    gradient: 'from-amber-500 to-orange-500', 
    glow: 'hover:shadow-amber-500/20' 
  },
  { 
    icon: Icons.HeartHandshake, 
    title: 'Your Religion & Values', 
    desc: 'Find a partner who respects your faith. Whether for a Poruwa, Kovil, Nikah, or Church wedding.', 
    gradient: 'from-blue-400 to-indigo-600', 
    glow: 'hover:shadow-indigo-500/20' 
  },
  { 
    icon: Icons.BadgeCheck, 
    title: 'Verified Profiles', 
    desc: 'We check NIC details to make sure every profile is real. A safe place for your son or daughter.', 
    gradient: 'from-emerald-400 to-teal-600', 
    glow: 'hover:shadow-emerald-500/20' 
  },
  { 
    icon: Icons.Globe, 
    title: 'Sri Lankans Abroad', 
    desc: 'Connect with Sri Lankan professionals living in Australia, UK, Canada, UAE, and other countries.', 
    gradient: 'from-rose-400 to-pink-600', 
    glow: 'hover:shadow-rose-500/20' 
  },
];

const stats = [
  { value: '100K+', label: 'Happy Users', icon: Icons.Users, color: 'text-rose-500 bg-rose-500/10' },
  { value: '4', label: 'Religions', icon: Icons.Heart, color: 'text-blue-500 bg-blue-500/10' },
  { value: '100%', label: 'Private', icon: Icons.Shield, color: 'text-amber-500 bg-amber-500/10' },
  { value: '24/7', label: 'Support', icon: Icons.MessageCircle, color: 'text-emerald-500 bg-emerald-500/10' },
];

const steps = [
  { step: '01', title: 'Create Profile', desc: 'Register for free. Add details about yourself, family background, and religion.', icon: Icons.UserPlus },
  { step: '02', title: 'Find Matches', desc: 'Search by District, Religion, Caste, or Country. View photos and horoscopes.', icon: Icons.Search },
  { step: '03', title: 'Start Talking', desc: 'Parents or individuals can chat securely. Get to know the family and plan the wedding.', icon: Icons.HeartHandshake },
];

const testimonials = [
  { name: 'Nuwan & Sanduni', location: 'Colombo (Buddhist)', text: 'It was hard to find a matching horoscope. But here, we found the perfect Porondam match easily.', color: 'from-amber-400 to-orange-600' },
  { name: 'Karthik & Priya', location: 'Jaffna / Canada (Hindu)', text: 'I live in Canada but wanted a partner who understands our Tamil culture. We met here and had a beautiful wedding.', color: 'from-rose-400 to-pink-600' },
  { name: 'Imran & Fathima', location: 'Kandy (Muslim)', text: 'Privacy was very important for our families. This site is very safe for Muslim marriage proposals.', color: 'from-emerald-400 to-teal-600' },
  { name: 'Shane & Sarah', location: 'Negombo (Christian)', text: 'We wanted a partner who shared our Catholic values. We found each other here and got married in our local church.', color: 'from-blue-400 to-indigo-600' },
];

/* =========================================
   SUB-COMPONENTS
   ========================================= */

const SectionHeader = ({ icon: Icon, badgeText, title, titleHighlight, desc }) => (
  <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-4">
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-xs font-bold uppercase tracking-wider mb-4 border border-[var(--accent-500)]/20 shadow-sm">
      {Icon && <Icon size={14} />}
      <span>{badgeText}</span>
    </div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-[var(--text-primary)] leading-tight">
      {title} <span className="text-gradient">{titleHighlight}</span>
    </h2>
    {desc && <p className="text-[var(--text-secondary)] text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto">{desc}</p>}
  </div>
);

/* =========================================
   MAIN COMPONENT
   ========================================= */

export default function HomePage() {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        
        {/* Background Slider */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            >
              <img 
                src={img} 
                alt="Sri Lankan Wedding" 
                // Using object-[center_30%] helps keep faces (usually near top) visible on mobile screens
                className={`w-full h-full object-cover object-[center_30%] transition-transform duration-[8000ms] ease-out ${index === currentImage ? 'scale-110' : 'scale-100'}`} 
              />
              {/* Gradient Overlay: Darker at bottom for text readability, clearer at top for faces */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90" />
            </div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 text-center pt-20 sm:pt-0">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-[10px] sm:text-xs mb-6 animate-fade-in shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            #1 Trusted Matrimony Site in Sri Lanka
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-xl tracking-tight">
            Find Your Life Partner <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              The Sri Lankan Way
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-100 mb-10 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md text-pretty">
            Safe, private, and trusted by thousands of Buddhist, Hindu, Muslim, and Christian families.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg mx-auto">
            <button
              onClick={() => navigate('/register')}
              className="w-full btn-primary py-4 text-base sm:text-lg shadow-xl shadow-amber-500/20 group rounded-xl sm:rounded-full"
            >
              <Icons.Heart size={20} className="fill-white group-hover:scale-110 transition-transform" />
              <span>Create Free Profile</span>
            </button>

            <button
              onClick={() => navigate('/search')}
              className="w-full btn-secondary bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md py-4 text-base sm:text-lg rounded-xl sm:rounded-full"
            >
              <Icons.Search size={20} />
              <span>Search Proposals</span>
            </button>
          </div>

          {/* Quick Search Tags */}
          <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-3 opacity-90">
            {['Buddhist', 'Hindu', 'Muslim', 'Christian', 'Abroad', 'Tamil', 'Sinhala'].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-white/90 text-[10px] sm:text-xs backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      {/* Mobile: No negative margin (stacks naturally). Desktop: Negative margin to overlap hero. */}
      <section className="relative z-20 px-4 mb-20 mt-6 lg:-mt-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-2xl shadow-xl border border-[var(--border-primary)] text-center transform hover:-translate-y-1 transition-transform duration-300 backdrop-blur-xl bg-opacity-95">
                <div className={`inline-flex p-3 rounded-full ${stat.color} mb-3 shadow-sm`}>
                  <stat.icon size={20} className="sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{stat.value}</h3>
                <p className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-16 sm:py-24 px-4 bg-[var(--bg-secondary)]/30">
        <div className="container mx-auto">
          <SectionHeader 
            icon={Icons.Star} 
            badgeText="Why Choose Us" 
            title="Respecting" 
            titleHighlight="Traditions" 
            desc="Modern technology meets Sri Lankan culture." 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div key={i} className={`group p-6 rounded-3xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl ${feature.glow}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-16 sm:py-24 px-4 overflow-hidden">
        <div className="container mx-auto relative">
          <SectionHeader icon={Icons.Settings} badgeText="Simple Process" title="How It" titleHighlight="Works" />
          
          <div className="hidden lg:block absolute top-28 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-500)]/30 to-transparent" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative z-10">
            {steps.map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shadow-lg mb-6 relative hover:scale-110 transition-transform duration-300 bg-gradient-to-b from-[var(--surface-glass)] to-[var(--bg-secondary)]">
                  <item.icon size={32} className="text-[var(--accent-500)] group-hover:text-[var(--accent-600)] transition-colors" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-[var(--accent-500)] text-white font-bold flex items-center justify-center text-sm shadow-md ring-4 ring-[var(--bg-primary)]">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS (Mobile Horizontal Scroll) ========== */}
      <section className="py-16 sm:py-24 px-4 bg-[var(--bg-secondary)]/30">
        <div className="container mx-auto">
          <SectionHeader icon={Icons.Heart} badgeText="Success Stories" title="Happy" titleHighlight="Couples" />
          
          <div className="flex overflow-x-auto pb-8 gap-4 sm:gap-6 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible scrollbar-hide">
            {testimonials.map((t, i) => (
              <div key={i} className="min-w-[85vw] sm:min-w-0 snap-center bg-[var(--surface-glass)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Icons.Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-[var(--text-primary)] italic mb-6 flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-primary)]">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold shadow-md`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA ========== */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-[var(--accent-500)] rounded-[2rem] sm:rounded-[3rem] p-8 md:p-12 text-center text-white shadow-2xl shadow-[var(--accent-500)]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Start Your Journey Today</h2>
              <p className="text-base sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join the largest and most trusted matrimonial community in Sri Lanka.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="btn bg-white text-[var(--accent-600)] hover:bg-gray-100 border-none px-8 py-4 text-base sm:text-lg font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
              >
                Register Free
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}