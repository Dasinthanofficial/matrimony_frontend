import React from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './Icons';

const footerLinks = {
  platform: [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Pricing', path: '/pricing' },
  ],
  support: [
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Privacy', path: '/privacy' },
  ],
};

const socialLinks = [
  { icon: Icons.Globe, label: 'Website', href: '#' },
  { icon: Icons.Mail, label: 'Email', href: 'mailto:support@matrimony.com' },
  { icon: Icons.Phone, label: 'Phone', href: 'tel:+1800123456' },
];

export default function PublicFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[var(--bg-secondary)]/50 backdrop-blur-sm">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[var(--accent-500)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-700)] flex items-center justify-center shadow-lg shadow-[var(--accent-500)]/20 group-hover:shadow-[var(--accent-500)]/40 transition-all">
                <Icons.Heart size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold">Matrimony</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
              Premium matchmaking for meaningful, lasting connections.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social, i) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-500)] hover:border-[var(--accent-500)]/30 hover:bg-[var(--accent-500)]/10 transition-all duration-300"
                    title={social.label}
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-500)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-500)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust Badges */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              Trusted
            </h4>
            <div className="space-y-3">
              {[
                { icon: Icons.Shield, text: '100% Secure', color: 'text-emerald-500' },
                { icon: Icons.BadgeCheck, text: 'Verified Profiles', color: 'text-blue-500' },
                { icon: Icons.Lock, text: 'Privacy First', color: 'text-violet-500' },
              ].map((badge, i) => {
                const IconComponent = badge.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                    <IconComponent size={14} className={badge.color} />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} Matrimony. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <Link to="/privacy" className="hover:text-[var(--accent-500)] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[var(--accent-500)] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}