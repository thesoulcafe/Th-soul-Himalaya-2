import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await addDoc(collection(db, 'messages'), {
        userId: auth.currentUser?.uid || null,
        userName: formData.name,
        userEmail: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'unread',
        createdAt: serverTimestamp()
      });

      setStatus({ type: 'success', message: 'Your message has been sent successfully!' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({ type: 'error', message: 'Failed to send message. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 bg-cream text-center px-6">
        <div className="max-w-3xl mx-auto">
          <MessageCircle className="h-12 w-12 text-terracotta mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-forest mb-4">Get in Touch</h1>
          <p className="text-forest/60 text-lg">We're here to help you plan your perfect Himalayan escape.</p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24 px-6 bg-cream min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white p-10">
              <h2 className="text-3xl font-heading font-bold text-forest mb-8">Send us a Message</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-forest/70">Full Name</label>
                    <Input 
                      placeholder="John Doe" 
                      className="rounded-xl border-forest/10 py-6"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-forest/70">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      className="rounded-xl border-forest/10 py-6"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/70">Subject</label>
                  <Input 
                    placeholder="How can we help?" 
                    className="rounded-xl border-forest/10 py-6"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-forest/70">Message</label>
                  <Textarea 
                    placeholder="Tell us about your travel plans..." 
                    className="rounded-xl border-forest/10 min-h-[150px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <p className="text-sm font-medium">{status.message}</p>
                  </motion.div>
                )}

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-8 rounded-full text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-3xl font-heading font-bold text-forest mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <MapPin className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1">Our Location</h4>
                    <p className="text-forest/60 text-sm">Tosh Village, Parvati Valley, Himachal Pradesh, India - 175105</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <Phone className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1">Phone Number</h4>
                    <p className="text-forest/60 text-sm">+91 98765 43210 (WhatsApp Available)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <Mail className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1">Email Address</h4>
                    <p className="text-forest/60 text-sm">hello@thesoulhimalaya.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <Clock className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest mb-1">Working Hours</h4>
                    <p className="text-forest/60 text-sm">Mon - Sun: 08:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="rounded-[2.5rem] overflow-hidden h-64 shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                alt="Map Placeholder"
                className="w-full h-full object-cover grayscale opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" className="bg-white/90 text-forest rounded-full shadow-lg">
                  Open in Google Maps
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
