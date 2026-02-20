import React, { useState } from 'react';
import { Icons } from '../components/Icons';

const contactInfo = [
  { icon: Icons.Mail, label: 'Email Support', value: 'support@matrimony.com', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Icons.Phone, label: 'Helpline', value: '+94 77 123 4567', color: 'text-green-500 bg-green-500/10' },
  { icon: Icons.MapPin, label: 'Office', value: 'Colombo, Sri Lanka', color: 'text-purple-500 bg-purple-500/10' },
  { icon: Icons.Clock, label: 'Hours', value: '24/7 Available', color: 'text-orange-500 bg-orange-500/10' },
];

const faqs = [
  { q: 'How do I verify my profile?', a: 'Go to Settings > Verification and upload a clear photo of your government-issued ID (NIC/Passport). Our team will review it within 24 hours.' },
  { q: 'Is my personal data secure?', a: 'Absolutely. We use banking-grade encryption and strict privacy controls. You decide who sees your photos and contact details.' },
  { q: 'How does matching work?', a: 'Our algorithm uses your horoscope (Porondam), religion, caste, and personal preferences to suggest highly compatible partners.' },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel your subscription at any time from your billing settings. Your benefits will continue until the end of the current period.' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => setSent(true), 500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-500)]/10 text-[var(--accent-500)] text-xs font-bold uppercase tracking-wider mb-6 border border-[var(--accent-500)]/20">
            <Icons.MessageSquare size={14} />
            <span>Support Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-4">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-500)] to-[var(--accent-600)]">Touch</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Have questions about our service or need help with your profile? 
            Our support team is here to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Info & FAQ */}
          <div className="space-y-8">
            
            {/* Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-primary)] hover:border-[var(--accent-500)]/30 transition-all duration-300 hover:shadow-lg group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FAQ Section */}
            <div className="rounded-3xl bg-[var(--surface-glass)] border border-[var(--border-primary)] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-[var(--accent-500)]/10 text-[var(--accent-500)]">
                  <Icons.HelpCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Frequently Asked Questions</h3>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="group [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none p-4 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-primary)]">
                      <span className="text-sm font-medium text-[var(--text-primary)] group-open:text-[var(--accent-500)] transition-colors">
                        {faq.q}
                      </span>
                      <span className="transition-transform duration-300 group-open:rotate-180 text-[var(--text-muted)]">
                        <Icons.ChevronDown size={16} />
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-sm text-[var(--text-secondary)] leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="relative rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-500)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-12 h-full min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-6 animate-scale-in">
                  <Icons.Check size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Message Sent!</h3>
                <p className="text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">
                  Thank you for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="btn-secondary px-6 py-3 rounded-xl"
                >
                  <Icons.RefreshCw size={16} className="mr-2" />
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <>
                <div className="relative z-10 mb-8">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Send us a Message</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Fill out the form below and we'll help you find your way.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Your Name</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/50 focus:border-[var(--accent-500)] transition-all placeholder:text-[var(--text-muted)]/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Email Address</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/50 focus:border-[var(--accent-500)] transition-all placeholder:text-[var(--text-muted)]/50"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Subject</label>
                    <div className="relative">
                      <select 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        className="w-full bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/50 focus:border-[var(--accent-500)] transition-all appearance-none cursor-pointer"
                      >
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Billing Question</option>
                        <option>Report an Issue</option>
                        <option>Partnership Inquiry</option>
                        <option>Feedback</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                        <Icons.ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase ml-1">Message</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full bg-[var(--surface-glass)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent-500)]/50 focus:border-[var(--accent-500)] transition-all placeholder:text-[var(--text-muted)]/50 resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full btn-primary py-4 text-base font-bold rounded-xl shadow-lg shadow-[var(--accent-500)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Icons.Send size={18} className="mr-2" />
                    <span>Send Message</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}