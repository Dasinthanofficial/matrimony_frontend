// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { Icons } from '../components/Icons';

const contactInfo = [
  { icon: Icons.Mail, label: 'Email', value: 'support@matrimony.com', color: 'icon-box-accent' },
  { icon: Icons.Phone, label: 'Phone', value: '+94 77 123 4567', color: 'icon-box-success' },
  { icon: Icons.MapPin, label: 'Location', value: 'Sri Lanka', color: 'icon-box-info' },
  { icon: Icons.Clock, label: 'Hours', value: '24/7 Support', color: 'icon-box-warning' },
];

const faqs = [
  { q: 'How do I verify my profile?', a: 'Upload a government ID in your profile settings. Our team will review and verify.', icon: Icons.UserCheck },
  { q: 'Is my data secure?', a: 'Yes, we use strong encryption and privacy controls. Your privacy is our top priority.', icon: Icons.Shield },
  { q: 'How does matching work?', a: 'We use your preferences and profile details to suggest compatible matches.', icon: Icons.Dna },
  { q: 'Can I cancel my subscription?', a: 'Yes, you can cancel anytime from your account settings.', icon: Icons.RefreshCw },
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
    setSent(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-28 lg:pt-36 pb-16">
      <div className="page-container px-4">
        <div className="text-center mb-12 lg:mb-16">
          <div className="pill mb-4 mx-auto w-fit">
            <Icons.MessageSquare size={14} />
            <span>Contact Us</span>
          </div>
          <h1 className="heading-xl mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-base lg:text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Have questions? Send us a message and we’ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {contactInfo.map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className={`icon-box-sm ${item.color}`}>
                        <IconComponent size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-medium">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="icon-box-sm icon-box-accent">
                  <Icons.HelpCircle size={16} />
                </div>
                <h3 className="font-semibold">Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => {
                  const IconComponent = faq.icon;
                  return (
                    <details key={i} className="group">
                      <summary className="flex items-center gap-3 cursor-pointer list-none">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0 group-open:bg-[var(--accent-500)]/10">
                          <IconComponent size={14} className="text-[var(--accent-500)]" />
                        </div>
                        <span className="text-sm font-medium flex-1">{faq.q}</span>
                        <Icons.ChevronDown size={16} className="text-[var(--text-muted)] group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="mt-2 pl-11 text-sm text-[var(--text-secondary)]">{faq.a}</div>
                    </details>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card-elevated p-6 lg:p-8 h-fit">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
                  <Icons.Check size={28} className="text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                  Thank you for reaching out. We’ll get back to you soon.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                  }}
                  className="btn-secondary"
                >
                  <Icons.RefreshCw size={16} />
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="icon-box-sm icon-box-accent">
                    <Icons.Send size={16} />
                  </div>
                  <h3 className="font-semibold">Send us a Message</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name</label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} className="select">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Report an Issue</option>
                      <option>Partnership Inquiry</option>
                      <option>Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Message</label>
                    <textarea
                      required
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="textarea"
                      placeholder="How can we help you today?"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full btn-lg">
                    <Icons.Send size={18} />
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