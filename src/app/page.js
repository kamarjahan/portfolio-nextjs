"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, Send, Linkedin, Github, Instagram, Mail, 
  ChevronRight, Award, Loader2, CheckCircle 
} from 'lucide-react';

// --- NEW: Import Firebase tools ---
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Portfolio() {
  // --- Typewriter Effect ---
  const [text, setText] = useState('');
  const fullText = "Finance Student. Tech Enthusiast. Future CA.";
  
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 100);
    return () => clearInterval(typing);
  }, []);

  // --- NEW: Form Logic ---
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // 1. Send data to Firebase "messages" collection
      await addDoc(collection(db, "messages"), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: serverTimestamp(), // Saves the exact time
      });

      // 2. Success! Clear form
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error("Error sending message: ", error);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-slate-light text-oxford overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-oxford">
            Kamar<span className="text-gold">Jahan</span>.in
          </h1>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-gray">
            <a href="#about" className="hover:text-oxford transition-colors">About</a>
            <a href="#skills" className="hover:text-oxford transition-colors">Skills</a>
            <a href="#roadmap" className="hover:text-oxford transition-colors">Roadmap</a>
          </div>
          <a href="#contact" className="px-5 py-2 bg-oxford text-white rounded-full hover:bg-gold transition-all shadow-lg text-sm font-bold">
            Hire Me
          </a>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left space-y-6 animate-fade-up">
          <p className="text-gold font-bold tracking-widest uppercase text-xs">Welcome to my Portfolio</p>
          <h1 className="text-5xl md:text-7xl font-black text-oxford leading-tight">
            Muhammad <br/> Kamar Jahan
          </h1>
          <div className="h-8">
             <p className="text-xl text-slate-gray font-medium border-r-4 border-gold inline-block pr-2">
              {text}
            </p>
          </div>
          <p className="text-slate-gray text-lg max-w-lg mx-auto md:mx-0 leading-relaxed">
            I bridge the gap between <strong>Financial Discipline</strong> and <strong>Technological Innovation</strong>. 
            Currently mastering Commerce & Code.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start pt-4">
            <button className="px-8 py-3 bg-oxford text-white rounded-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 font-bold">
              <Download size={18} /> Download Resume
            </button>
            <a href="#contact" className="px-8 py-3 border-2 border-oxford text-oxford rounded-lg hover:bg-oxford hover:text-white transition-all flex items-center justify-center gap-2 font-bold">
              Contact Me
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center relative">
          <div className="absolute w-80 h-80 bg-blue-100 rounded-full blur-3xl -z-10 top-10 animate-pulse-slow"></div>
          <div className="w-64 h-64 md:w-96 md:h-96 bg-gray-200 rounded-full border-8 border-white shadow-2xl overflow-hidden animate-float relative">
             <img src="/profile.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-oxford">About Me</h2>
            <p className="text-slate-gray text-lg leading-loose">
              I am a dedicated student at <strong>NIOS Senior Secondary</strong> with a unique edge. 
              Unlike traditional finance students, I have deep technical expertise in <strong>Web Development</strong> and <strong>Microsoft Office</strong>.
              <br/><br/>
              My goal is to become a <strong>Chartered Accountant (CA)</strong> who understands the technology that drives modern finance.
            </p>
            <div className="pt-4 border-t border-gray-100">
               <p className="font-serif italic text-2xl text-oxford">Muhammad Kamar Jahan</p>
            </div>
          </div>
          <div className="bg-slate-light border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
             <div className="flex justify-between items-start mb-4">
                <div className="bg-oxford p-3 rounded-lg text-white">
                   <Award size={28} />
                </div>
                <span className="bg-gold/20 text-oxford px-3 py-1 rounded-full text-xs font-bold uppercase">Certified</span>
             </div>
             <h3 className="text-xl font-bold text-oxford">Course on Computer Concepts</h3>
             <p className="text-slate-gray">Issued by CDAC • 2024</p>
             <div className="mt-6 flex items-center text-gold font-bold text-sm group-hover:gap-2 transition-all">
                View Credential <ChevronRight size={16} />
             </div>
          </div>
        </div>
      </section>

      {/* --- SKILLS SECTION --- */}
      <section id="skills" className="py-24 bg-slate-light">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-oxford mb-12">Technical Proficiency</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-gray uppercase tracking-widest mb-6">Finance & Office</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {["Microsoft Excel (Expert)", "Tally Prime", "Accounting", "Data Analysis", "MS Word"].map((s) => (
                  <span key={s} className="px-4 py-2 bg-slate-light border border-gray-200 rounded-lg text-oxford font-medium text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-gray uppercase tracking-widest mb-6">Development</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {["React.js & Next.js", "Firebase Auth & DB", "HTML5 / CSS3", "Tailwind CSS", "Git / GitHub"].map((s) => (
                  <span key={s} className="px-4 py-2 bg-slate-light border border-gray-200 rounded-lg text-oxford font-medium text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROADMAP SECTION --- */}
      <section id="roadmap" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-oxford text-center mb-16">My Journey</h2>
          <div className="relative border-l-2 border-gray-200 ml-6 md:ml-1/2 space-y-12">
             <div className="relative pl-8 md:pl-0 md:flex md:flex-row-reverse items-center justify-between w-full group">
                <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-[9px] w-5 h-5 bg-oxford rounded-full border-4 border-white shadow-md z-10"></div>
                <div className="md:w-[45%] bg-slate-light p-6 rounded-xl border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
                   <span className="text-xs font-bold text-slate-gray">2024 (Completed)</span>
                   <h4 className="text-lg font-bold text-oxford">CDAC Certification</h4>
                   <p className="text-sm text-slate-500">Mastered Computer Concepts & Web Basics.</p>
                </div>
             </div>
             <div className="relative pl-8 md:pl-0 md:flex items-center justify-between w-full group">
                <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-[9px] w-5 h-5 bg-gold rounded-full border-4 border-white shadow-lg animate-pulse z-10"></div>
                <div className="md:w-[45%] bg-white p-6 rounded-xl border-2 border-gold shadow-lg transform md:text-right">
                   <span className="text-xs font-bold text-gold">Present</span>
                   <h4 className="text-lg font-bold text-oxford">NIOS Senior Secondary</h4>
                   <p className="text-sm text-slate-500">Commerce Stream. Building the foundation.</p>
                </div>
             </div>
             <div className="relative pl-8 md:pl-0 md:flex md:flex-row-reverse items-center justify-between w-full opacity-70 hover:opacity-100 transition-opacity">
                <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-[9px] w-5 h-5 bg-white border-4 border-gray-300 rounded-full z-10"></div>
                <div className="md:w-[45%] p-6 rounded-xl border border-dashed border-gray-300">
                   <span className="text-xs font-bold text-slate-gray">2026 (Target)</span>
                   <h4 className="text-lg font-bold text-oxford">CA Foundation</h4>
                   <p className="text-sm text-slate-500">Entering the world of Professional Finance.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION (UPDATED) --- */}
      <section id="contact" className="py-24 bg-oxford text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
           <div>
              <h2 className="text-4xl font-bold mb-4">Let's Connect</h2>
              <p className="text-slate-400 mb-8">I am available for freelance web projects or finance internships.</p>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-lg hover:text-gold transition-colors cursor-pointer">
                    <Mail /> contact@kamarjahan.in
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Linkedin className="hover:text-gold cursor-pointer transition-colors" />
                    <Instagram className="hover:text-gold cursor-pointer transition-colors" />
                    <Github className="hover:text-gold cursor-pointer transition-colors" />
                 </div>
              </div>
           </div>

           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl text-oxford shadow-2xl space-y-4">
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                type="text" 
                placeholder="Your Name" 
                className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all" 
              />
              <input 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                type="email" 
                placeholder="Your Email" 
                className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all" 
              />
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                required 
                rows="3" 
                placeholder="Message" 
                className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all"
              ></textarea>
              
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full py-4 bg-oxford text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
              >
                 {status === 'loading' ? (
                   <> <Loader2 className="animate-spin" /> Sending... </>
                 ) : status === 'success' ? (
                   <> <CheckCircle className="text-green-400" /> Sent Successfully! </>
                 ) : (
                   <> <Send size={18} /> Send Message </>
                 )}
              </button>
           </form>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-400 text-sm bg-oxford border-t border-gray-800">
        <p>© 2025 Muhammad Kamar Jahan. Built with Next.js & Firebase.</p>
      </footer>
    </main>
  );
}