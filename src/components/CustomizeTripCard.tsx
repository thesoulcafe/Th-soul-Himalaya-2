import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Zap, Phone as PhoneIcon } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface CustomizeTripCardProps {
  places?: string[];
  treks?: string[];
  yoga?: string[];
  meditation?: string[];
  title?: string;
  description?: string;
}

export default function CustomizeTripCard({
  places = ['Tosh', 'Kasol', 'Malana', 'Manikaran', 'Pulga', 'Kalga'],
  treks = ['Kheerganga', 'Bunbuni Pass', 'Sar Pass', 'Pin Parvati'],
  yoga = ['Hatha Yoga', 'Vinyasa Flow', 'Ashtanga', 'Yin Yoga'],
  meditation = ['Vipassana', 'Guided Meditation', 'Sound Healing', 'Zen'],
  title = "Customize your trip",
  description = "Tell us your preferences and we'll craft the perfect Himalayan experience for you."
}: CustomizeTripCardProps) {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('1');
  const [requests, setRequests] = useState('');
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [selectedTreks, setSelectedTreks] = useState<string[]>([]);
  const [selectedYoga, setSelectedYoga] = useState<string[]>([]);
  const [selectedMeditation, setSelectedMeditation] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSelection = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-forest text-white overflow-hidden">
      <div className="relative p-8 pb-0">
        <div className="absolute -right-8 -top-8 opacity-10">
          <Zap className="h-40 w-40" />
        </div>
        <Badge className="bg-terracotta text-white border-none mb-4 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Tailor-Made
        </Badge>
        <h3 className="text-3xl font-heading font-bold mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-8">{description}</p>
      </div>

      <div className="p-8 pt-0">
        <form className="space-y-6" onSubmit={async (e) => {
          e.preventDefault();
          
          if (!fullName || !email || !phone) {
            toast.error("Missing Information", {
              description: "Please fill in your name, email, and phone number.",
            });
            return;
          }

          setIsSubmitting(true);

          try {
            const summary = `
      Places: ${selectedPlaces.join(', ') || 'N/A'}
      Treks: ${selectedTreks.join(', ') || 'N/A'}
      Yoga: ${selectedYoga.join(', ') || 'N/A'}
      Meditation: ${selectedMeditation.join(', ') || 'N/A'}
      Dates: ${startDate} to ${endDate}
      Guests: ${guests}
      Special Requests: ${requests}
            `.trim();

            await addDoc(collection(db, 'messages'), {
              userId: auth.currentUser?.uid || null,
              userName: fullName,
              userEmail: email,
              userPhone: phone,
              subject: 'Tailor-Made Journey Inquiry',
              message: summary,
              status: 'unread',
              createdAt: serverTimestamp(),
              metadata: {
                selectedPlaces,
                selectedTreks,
                selectedYoga,
                selectedMeditation,
                startDate,
                endDate,
                guests,
                source: 'TailorMadePage'
              }
            });

            // Redirect to success page
            navigate('/enquiry-success');
            
          } catch (error) {
            console.error("Error submitting inquiry:", error);
            toast.error("Submission Failed", {
              description: "There was an error sending your request. Please try again later.",
            });
          } finally {
            setIsSubmitting(false);
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Full Name</label>
              <Input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name" 
                className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 h-12 focus:ring-terracotta/50" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 h-12 focus:ring-terracotta/50" 
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Mobile Number</label>
            <Input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your WhatsApp number (e.g. +91 ...)" 
              className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 h-12 focus:ring-terracotta/50" 
              required
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Places to Visit</label>
              <div className="grid grid-cols-2 gap-2">
                {places.map(place => (
                  <label key={place} className="flex items-center space-x-2 text-[10px] text-white/70 cursor-pointer hover:text-terracotta transition-colors bg-white/5 p-2 rounded-xl border border-white/5 hover:border-terracotta/30">
                    <input 
                      type="checkbox" 
                      checked={selectedPlaces.includes(place)}
                      onChange={() => toggleSelection(selectedPlaces, setSelectedPlaces, place)}
                      className="rounded border-white/10 text-terracotta focus:ring-terracotta bg-transparent h-3 w-3" 
                    />
                    <span className="truncate">{place}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Trekks to Include</label>
              <div className="grid grid-cols-2 gap-2">
                {treks.map(trek => (
                  <label key={trek} className="flex items-center space-x-2 text-[10px] text-white/70 cursor-pointer hover:text-terracotta transition-colors bg-white/5 p-2 rounded-xl border border-white/5 hover:border-terracotta/30">
                    <input 
                      type="checkbox" 
                      checked={selectedTreks.includes(trek)}
                      onChange={() => toggleSelection(selectedTreks, setSelectedTreks, trek)}
                      className="rounded border-white/10 text-terracotta focus:ring-terracotta bg-transparent h-3 w-3" 
                    />
                    <span className="truncate">{trek}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Yoga Style</label>
                <div className="space-y-2">
                  {yoga.slice(0, 2).map(y => (
                    <label key={y} className="flex items-center space-x-2 text-[10px] text-white/70 cursor-pointer hover:text-terracotta transition-colors bg-white/5 p-2 rounded-xl border border-white/5 hover:border-terracotta/30">
                      <input 
                        type="checkbox" 
                        checked={selectedYoga.includes(y)}
                        onChange={() => toggleSelection(selectedYoga, setSelectedYoga, y)}
                        className="rounded border-white/10 text-terracotta focus:ring-terracotta bg-transparent h-3 w-3" 
                      />
                      <span className="truncate">{y}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Meditation</label>
                <div className="space-y-2">
                  {meditation.slice(0, 2).map(m => (
                    <label key={m} className="flex items-center space-x-2 text-[10px] text-white/70 cursor-pointer hover:text-terracotta transition-colors bg-white/5 p-2 rounded-xl border border-white/5 hover:border-terracotta/30">
                      <input 
                        type="checkbox" 
                        checked={selectedMeditation.includes(m)}
                        onChange={() => toggleSelection(selectedMeditation, setSelectedMeditation, m)}
                        className="rounded border-white/10 text-terracotta focus:ring-terracotta bg-transparent h-3 w-3" 
                      />
                      <span className="truncate">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Start Date</label>
              <Input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-2xl border-white/10 bg-white/5 text-white h-12 focus:ring-terracotta/50 text-xs" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">End Date</label>
              <Input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-2xl border-white/10 bg-white/5 text-white h-12 focus:ring-terracotta/50 text-xs" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Guests</label>
            <Input 
              type="number" 
              min="1" 
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="1" 
              className="rounded-2xl border-white/10 bg-white/5 text-white h-12 focus:ring-terracotta/50" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-1">Special Requests</label>
            <Textarea 
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="Any specific requirements?" 
              className="rounded-2xl border-white/10 bg-white/5 text-white placeholder:text-white/20 min-h-[80px] focus:ring-terracotta/50" 
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-8 rounded-2xl text-lg font-bold shadow-xl shadow-terracotta/20 group disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Zap className="h-5 w-5 mr-2 transition-transform group-hover:scale-125" />
            )}
            {isSubmitting ? 'Submitting...' : 'Enquire Now'}
          </Button>
        </form>
        <div className="mt-8 flex items-center justify-center gap-4 text-white/40">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-forest bg-forest flex items-center justify-center overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">500+ Trips Customized</span>
        </div>
      </div>
    </Card>
  );
}
