import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

/* =========================================
   SRI LANKAN DATA CONSTANTS
   ========================================= */

const heroImages = [
  "https://images.unsplash.com/photo-1621621667797-e06af521d96e?q=80&w=2070&auto=format&fit=crop", // Traditional/Kandyan
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop", // Western/Christian
  "https://images.unsplash.com/photo-1610173827002-6b47c0f99d63?q=80&w=2070&auto=format&fit=crop", // Hindu/Cultural
];

const features = [
  { 
    icon: Icons.Sparkles, 
    title: 'Horoscope Check', 
    desc: 'Easily match Porondam (Grahacharaya). Essential for Buddhist and Hindu marriage proposals.', 
    gradient: 'from-amber-500 to-orange-500', 
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
  },
  { 
    icon: Icons.HeartHandshake, 
    title: 'Your Religion & Values', 
    desc: 'Find a partner who respects your faith. Whether for a Poruwa, Kovil, Nikah, or Church wedding.', 
    gradient: 'from-blue-400 to-indigo-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]' 
  },
  { 
    icon: Icons.BadgeCheck, 
    title: 'Verified Profiles', 
    desc: 'We check NIC details to make sure every profile is real. A safe place for your son or daughter.', 
    gradient: 'from-emerald-400 to-teal-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
  },
  { 
    icon: Icons.Globe, 
    title: 'Sri Lankans Abroad', 
    desc: 'Connect with Sri Lankan professionals living in Australia, UK, Canada, UAE, and other countries.', 
    gradient: 'from-rose-400 to-pink-600', 
    glow: 'hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]' 
  },
];

const stats = [
  { value: '100K+', label: 'Happy Users', icon: Icons.Users, color: 'text-rose-500 bg-rose-500/10 ring-rose-500/20' },
  { value: '4', label: 'Religions', icon: Icons.Heart, color: 'text-blue-500 bg-blue-500/10 ring-blue-500/20' },
  { value: '100%', label: 'Private', icon: Icons.Shield, color: 'text-amber-500 bg-amber-500/10 ring-amber-500/20' },
  { value: '24/7', label: 'Support', icon: Icons.MessageCircle, color: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20' },
];

const steps = [
  { step: '01', title: 'Create Profile', desc: 'Register for free. Add details about yourself, family background, and religion.', icon: Icons.UserPlus },
  { step: '02', title: 'Find Matches', desc: 'Search by District, Religion, Caste, or Country. View photos and horoscopes.', icon: Icons.Search },
  { step: '03', title: 'Start Talking', desc: 'Parents or individuals can chat securely. Get to know the family and plan the wedding.', icon: Icons.HeartHandshake },
];

const testimonials = [
  { 
    name: 'Nuwan & Sanduni', 
    location: 'Colombo (Buddhist)', 
    text: 'It was hard to find a matching horoscope. But here, we found the perfect Porondam match easily. Our parents are very happy.', 
    color: 'from-amber-400 to-orange-600' 
  },
  { 
    name: 'Karthik & Priya', 
    location: 'Jaffna / Canada (Hindu)', 
    text: 'I live in Canada but wanted a partner who understands our Tamil culture. We met here and had a beautiful wedding in Nallur.', 
    color: 'from-rose-400 to-pink-600' 
  },
  { 
    name: 'Imran & Fathima', 
    location: 'Kandy (Muslim)', 
    text: 'Privacy was very important for our families. This site is very safe for Muslim marriage proposals. Highly recommended.', 
    color: 'from-emerald-400 to-teal-600' 
  },
  { 
    name: 'Shane & Sarah', 
    location: 'Negombo (Christian)', 
    text: 'We wanted a partner who shared our Catholic values. We found each other here and got married in our local church.', 
    color: 'from-blue-400 to-indigo-600' 
  },
];

/* =========================================
   SUB-COMPONENTS
   ========================================= */

const SectionHeader = ({ icon: Icon, badgeText, title, titleHighlight, desc }) => (
  <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-4">
    <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-[10px] min-[400px]:text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6 ring-1 ring-[var(--accent-500)]/30 shadow-[0_0_20px_rgba(199,131,123,0.15)] backdrop-blur-md">
      {Icon && <Icon size={16} className="w-4 h-4" />}
      <span>{badgeText}</span>
    </div>
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-[var(--text-primary)] leading-tight tracking-tight text-balance">
      {title} <span className="text-gradient block sm:inline">{titleHighlight}</span>
    </h2>
    {desc && <p className="text-[var(--text-secondary)] text-sm sm:text-lg leading-relaxed px-2 sm:px-0 text-pretty">{desc}</p>}
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
    <div className="w-full flex flex-col overflow-x-hidden bg-[var(--bg-primary)] selection:bg-[var(--accent-500)] selection:text-white">
      
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[100svh] flex items-center justify-center pt-28 pb-16 lg:pt-32 overflow-hidden w-full">
        
        {/* Background Carousel - Fixed Z-Indices to stay behind mobile menu */}
        <div className="absolute inset-0 z-0 bg-[var(--bg-primary)]">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Overlays */}
              <div className="absolute inset-0 bg-[var(--bg-primary)]/40 dark:bg-[#07090f]/60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/30" />
              
              <img 
                src={img} 
                alt="Sri Lankan Wedding" 
                className={`w-full h-full object-cover object-center transform transition-transform duration-[8000ms] ease-out mix-blend-multiply dark:mix-blend-normal ${
                  index === currentImage ? 'scale-105' : 'scale-100'
                }`} 
              />
            </div>
          ))}
          {/* Noise texture - kept at low z-index */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay pointer-events-none"></div>
        </div>

        {/* Content Container - Z-Index changed from 40 to 10 to allow Menu (z-50) to overlay correctly */}
        <div className="relative page-container z-10 w-full flex flex-col items-center">
          <div className="text-center max-w-5xl mx-auto px-4 mt-4 sm:mt-8 w-full">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 sm:py-2.5 rounded-full bg-[var(--surface-glass)] ring-1 ring-[var(--border-primary)] shadow-xl backdrop-blur-xl mb-6 sm:mb-8 transition-transform hover:scale-105 cursor-default group">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] min-[400px]:text-xs sm:text-sm font-semibold tracking-wide text-[var(--text-primary)] drop-shadow-sm group-hover:text-[var(--accent-500)] transition-colors">
                #1 Trusted Site in Sri Lanka
              </span>
            </div>

            {/* Main Heading - Responsive Text Sizing */}
            <h1 className="text-4xl min-[400px]:text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-5 sm:mb-8 tracking-tight text-[var(--text-primary)] drop-shadow-sm leading-tight px-1 sm:px-0 break-words w-full">
              Find Your Life Partner
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] block mt-2 pb-2">
                The Sri Lankan Way
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm min-[400px]:text-base md:text-lg lg:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed font-medium px-2 sm:px-0 text-pretty">
              The most trusted place for Buddhist, Hindu, Muslim, and Christian families to find marriage proposals. Safe, private, and easy to use.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-6 py-4 text-base sm:text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] rounded-2xl sm:rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 min-w-[200px]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Icons.Heart size={20} className="fill-current mr-2 w-5 h-5" />
                <span>Create Free Profile</span>
                <Icons.ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/search')}
                className="w-full sm:w-auto text-base sm:text-lg py-4 px-6 bg-[var(--surface-glass)] hover:bg-[var(--surface-glass-hover)] text-[var(--text-primary)] ring-1 ring-[var(--border-primary)] backdrop-blur-xl shadow-lg transition-all duration-300 flex items-center justify-center min-w-[200px] rounded-2xl sm:rounded-full active:scale-95 hover:scale-[1.02]"
              >
                <Icons.Globe size={20} className="mr-2 w-5 h-5 text-[var(--accent-500)]" />
                <span>Search Proposals</span>
              </button>
            </div>
            
            {/* Quick Search Tags */}
            <div className="mt-12 sm:mt-16 relative">
              <div className="w-full overflow-x-auto snap-x snap-mandatory flex sm:flex-wrap sm:justify-center items-center gap-2 sm:gap-3 px-4 sm:px-0 pb-4 sm:pb-0 scrollbar-hide">
                <span className="flex-shrink-0 text-[var(--text-muted)] uppercase tracking-widest text-[10px] sm:text-xs pl-2 sm:pl-0 font-bold">Search:</span>
                {[
                  'Buddhist', 'Hindu', 'Muslim', 'Christian', 'Sinhala', 'Tamil', 'Abroad'
                ].map((tag) => (
                  <span key={tag} className="flex-shrink-0 snap-center px-4 py-2 rounded-xl bg-[var(--surface-glass)] ring-1 ring-[var(--border-primary)] hover:bg-[var(--surface-glass-hover)] hover:ring-[var(--accent-500)]/50 transition-all duration-300 cursor-pointer backdrop-blur-md shadow-sm active:scale-95 text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="relative z-10 -mt-8 sm:-mt-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-[var(--bg-secondary)]/90 backdrop-blur-2xl ring-1 ring-[var(--border-primary)] hover:ring-[var(--accent-500)]/40 hover:bg-[var(--surface-glass)] transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]">
                <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.color} ring-1 mb-3 sm:mb-5 transition-transform group-hover:-translate-y-1 group-hover:scale-110 duration-500 shadow-sm`}>
                  <stat.icon size={28} className="sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-black mb-1.5 text-[var(--text-primary)] tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="page-container relative z-10">
          <SectionHeader 
            icon={Icons.Star}
            badgeText="Our Service"
            title="Respecting All"
            titleHighlight="Traditions"
            desc="We use modern technology to help you find a partner while keeping our Sri Lankan culture and values."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative p-6 sm:p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ring-1 ring-[var(--border-primary)] bg-gradient-to-b from-[var(--surface-glass)] to-transparent backdrop-blur-xl active:scale-[0.98] overflow-hidden ${feature.glow}`}
              >
                <div className={`inline-flex p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-5 sm:mb-6 shadow-lg shadow-black/10 transform group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon size={24} className="sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[var(--text-primary)] tracking-tight">{feature.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-base text-pretty">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <section className="py-20 sm:py-32 bg-[var(--surface-glass)]/20 border-y border-[var(--border-primary)] relative overflow-hidden">
        <div className="page-container relative z-10">
          <SectionHeader 
            icon={Icons.Settings}
            badgeText="Easy Process"
            title="How to Find a"
            titleHighlight="Partner"
            desc="Finding a marriage proposal is simple. Just follow these 3 steps."
          />

          <div className="relative max-w-5xl mx-auto mt-12 sm:mt-24 px-4">
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-500)]/30 to-transparent" />

            <div className="grid md:grid-cols-3 gap-12 sm:gap-16">
              {steps.map((item, i) => (
                <div key={i} className="relative text-center group bg-[var(--surface-glass)]/50 sm:bg-transparent p-8 sm:p-0 rounded-[2rem] ring-1 sm:ring-0 ring-[var(--border-primary)] backdrop-blur-sm sm:backdrop-blur-none transition-all hover:bg-[var(--surface-glass)] sm:hover:bg-transparent">
                  <div className="relative inline-flex mb-6 sm:mb-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] ring-1 ring-[var(--border-primary)] group-hover:ring-[var(--accent-500)]/50 flex items-center justify-center text-[var(--text-primary)] shadow-2xl sm:group-hover:-translate-y-2 transition-all duration-500 z-10 backdrop-blur-xl relative">
                      <item.icon size={32} className="text-[var(--accent-500)] sm:w-10 sm:h-10 transition-transform group-hover:scale-110 duration-500" />
                    </div>
                    <span className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] text-white text-sm sm:text-base font-bold flex items-center justify-center shadow-lg transform rotate-12 group-hover:rotate-0 transition-all duration-500 z-20 ring-4 ring-[var(--bg-primary)]">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] max-w-[280px] mx-auto leading-relaxed text-sm sm:text-base text-pretty">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS SECTION ========== */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="page-container relative z-10">
          <SectionHeader 
            icon={Icons.Heart}
            badgeText="Success Stories"
            title="Happy"
            titleHighlight="Couples"
            desc="See what other Sri Lankan families are saying about us."
          />

          <div className="relative">
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-6 overflow-x-auto snap-x snap-mandatory px-4 sm:px-0 pb-8 sm:pb-0 -mx-4 sm:mx-0 scrollbar-hide">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="w-[85vw] sm:w-auto flex-shrink-0 snap-center p-6 sm:p-8 flex flex-col h-full bg-gradient-to-br from-[var(--surface-glass)] to-transparent ring-1 ring-[var(--border-primary)] hover:ring-[var(--accent-500)]/40 hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-2xl relative overflow-hidden group active:scale-[0.98] rounded-[2rem]">
                  
                  <div className="flex items-center gap-1 mb-5 sm:mb-6">
                    {[...Array(5)].map((_, j) => (
                      <Icons.Star key={j} size={16} className="text-amber-400 fill-amber-400 sm:w-4 sm:h-4" />
                    ))}
                  </div>
                  
                  <blockquote className="text-sm sm:text-base text-[var(--text-primary)] mb-8 sm:mb-10 flex-1 leading-relaxed font-medium italic relative z-10 whitespace-normal text-pretty">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4 pt-5 sm:pt-6 border-t border-[var(--border-primary)] relative z-10">
                    <div className={`w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-[var(--bg-primary)] flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <cite className="not-italic font-bold text-[var(--text-primary)] block text-sm sm:text-base truncate">{testimonial.name}</cite>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Icons.MapPin size={12} className="text-[var(--text-muted)] flex-shrink-0" />
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider truncate">{testimonial.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FINAL CTA SECTION ========== */}
      <section className="pb-20 sm:pb-32 pt-8 sm:pt-12">
        <div className="page-container px-4">
          <div className="relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden p-8 sm:p-16 lg:p-24 text-center ring-1 ring-[var(--border-primary)] shadow-2xl bg-[var(--bg-secondary)]">
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="inline-flex p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[var(--surface-glass)] ring-1 ring-[var(--border-primary)] text-[var(--accent-500)] mb-6 sm:mb-10 shadow-[0_0_30px_rgba(199,131,123,0.1)] backdrop-blur-md">
                <Icons.Heart size={32} className="sm:w-14 sm:h-14 animate-pulse drop-shadow-md" />
              </div>
              
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-8 text-[var(--text-primary)] tracking-tight leading-[1.1] text-balance">
                Start Your <span className="text-gradient">Mangala</span> Journey
              </h2>
              
              <p className="text-base sm:text-lg lg:text-2xl text-[var(--text-secondary)] mb-10 sm:mb-14 leading-relaxed px-2 font-medium text-pretty">
                Find a partner who shares your religion, values, and traditions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full items-center">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 py-4 sm:py-5 text-base sm:text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-700)] rounded-2xl sm:rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 min-w-[240px]"
                >
                  <Icons.Sparkles size={22} className="mr-2 sm:w-6 sm:h-6" />
                  <span>Register for Free</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}