"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, Send, Linkedin, Github, Instagram, Mail, 
  ExternalLink, Code, CheckCircle, Loader2, Award, Menu, X 
} from 'lucide-react';

import { db } from '../firebase'; 
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function Portfolio() {
  const [text, setText] = useState('');
  const fullText = "Finance Student. Tech Enthusiast. Future CA.";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- DATABASE DATA ---
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [roadmap, setRoadmap] = useState([]);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 100);

    // FETCH ALL DATA
    const fetchAll = async () => {
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const achieveSnap = await getDocs(collection(db, "achievements"));
      setAchievements(achieveSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const roadSnap = await getDocs(collection(db, "roadmap"));
      // Sort roadmap by year if possible, or just mapping
      setRoadmap(roadSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchAll();

    return () => clearInterval(typing);
  }, []);

  // Contact Form
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await addDoc(collection(db, "messages"), { ...formData, timestamp: serverTimestamp() });
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) { setStatus('error'); }
  };

  return (
    <main className="min-h-screen bg-slate-light text-oxford overflow-x-hidden">
      
      {/* --- NEW MENU BAR --- */}
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-oxford">
            Kamar<span className="text-gold">Jahan</span>.in
          </h1>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
            <a href="#home" className="hover:text-gold transition-colors">Home</a>
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#achievements" className="hover:text-gold transition-colors">Achievements</a>
            <a href="#roadmap" className="hover:text-gold transition-colors">Goals</a>
            <a href="#projects" className="hover:text-gold transition-colors">Projects</a>
            {/* Secret Admin Link */}
            <a href="/admin" className="text-slate-300 hover:text-oxford">Admin</a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 flex flex-col gap-4 font-bold shadow-xl">
            <a href="#home" onClick={()=>setMobileMenuOpen(false)}>Home</a>
            <a href="#achievements" onClick={()=>setMobileMenuOpen(false)}>Achievements</a>
            <a href="#roadmap" onClick={()=>setMobileMenuOpen(false)}>Goals</a>
            <a href="/admin" className="text-gold">Admin Panel</a>
          </div>
        )}
      </nav>

      {/* --- HERO --- */}
      <section id="home" className="pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left space-y-6 animate-fade-up">
          <p className="text-gold font-bold tracking-widest uppercase text-xs">Welcome to my Portfolio</p>
          <h1 className="text-5xl md:text-7xl font-black text-oxford leading-tight">
            Muhammad <br/> Kamar Jahan
          </h1>
          <div className="h-8">
             <p className="text-xl text-slate-gray font-medium border-r-4 border-gold inline-block pr-2">{text}</p>
          </div>
          <p className="text-slate-gray text-lg max-w-lg mx-auto md:mx-0 leading-relaxed">
            I bridge the gap between <strong>Financial Discipline</strong> and <strong>Technological Innovation</strong>. 
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start pt-4">
            <a 
  href="/resume.pdf" 
  download="Kamar_Jahan_Resume.pdf" 
  className="px-8 py-3 bg-oxford text-white rounded-lg shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 font-bold cursor-pointer"
>
  <Download size={18} /> Download Resume
</a>
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

      {/* --- DYNAMIC ACHIEVEMENTS SECTION --- */}
      <section id="achievements" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-oxford mb-12 text-center">Achievements & Certifications</h2>
          
          {achievements.length === 0 ? (
            <p className="text-center text-slate-400">Add your achievements in Admin Panel...</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {achievements.map((item) => (
                <div key={item.id} className="bg-slate-light border border-gray-200 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-oxford p-3 rounded-lg text-white">
                      <Award size={28} />
                    </div>
                    <span className="bg-gold/20 text-oxford px-3 py-1 rounded-full text-xs font-bold uppercase">Certified</span>
                  </div>
                  <h3 className="text-xl font-bold text-oxford">{item.title}</h3>
                  <p className="text-slate-gray">Issued by {item.issuer} • {item.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- DYNAMIC ROADMAP SECTION --- */}
      <section id="roadmap" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-oxford text-center mb-16">My Goals & Roadmap</h2>
          
          <div className="relative border-l-2 border-gray-200 ml-6 md:ml-1/2 space-y-12">
            {roadmap.length === 0 && <p className="text-center text-slate-400 pl-8">Add your goals in Admin Panel...</p>}
            
            {roadmap.map((item, index) => (
               <div key={item.id} className={`relative pl-8 md:pl-0 md:flex ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center justify-between w-full group`}>
                 {/* Center Dot */}
                 <div className={`absolute -left-[9px] md:left-1/2 md:-translate-x-[9px] w-5 h-5 rounded-full border-4 border-white shadow-md z-10 
                   ${item.status === 'completed' ? 'bg-oxford' : item.status === 'current' ? 'bg-gold animate-pulse' : 'bg-gray-300'}`}>
                 </div>

                 {/* Content Box */}
                 <div className={`md:w-[45%] p-6 rounded-xl border shadow-sm transition-all
                    ${item.status === 'current' ? 'bg-white border-2 border-gold shadow-lg' : 'bg-slate-light border-gray-100'}`}>
                    <span className={`text-xs font-bold uppercase ${item.status === 'current' ? 'text-gold' : 'text-slate-500'}`}>
                      {item.status === 'completed' ? 'Completed' : item.status === 'current' ? 'Present' : 'Target'}
                    </span>
                    <h4 className="text-lg font-bold text-oxford">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.org} • {item.year}</p>
                    {item.desc && <p className="text-sm text-slate-400 mt-2">{item.desc}</p>}
                 </div>
               </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DYNAMIC PROJECTS --- */}
      <section id="projects" className="py-24 bg-slate-light">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-oxford text-center mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:-translate-y-2 transition-all flex flex-col">
                {proj.imageUrl ? (
                    <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100">
                      <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-blue-50 rounded-lg text-oxford"><Code size={20} /></div>
                    </div>
                )}
                <h3 className="font-bold text-xl text-oxford mb-2">{proj.title}</h3>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">{proj.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full">{proj.tech}</span>
                    {proj.link && (
                      <a href={proj.link} target="_blank" className="flex items-center gap-1 text-sm font-bold text-oxford hover:text-gold transition-colors">
                        View <ExternalLink size={16} />
                      </a>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className="py-24 bg-oxford text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
           <div>
              <h2 className="text-4xl font-bold mb-4">Let's Connect</h2>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 text-lg hover:text-gold transition-colors cursor-pointer">
                    <Mail /> contact@kamarjahan.in
                 </div>
              </div>
           </div>
           <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl text-oxford shadow-2xl space-y-4">
              <input name="name" value={formData.name} onChange={handleChange} required type="text" placeholder="Your Name" className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all" />
              <input name="email" value={formData.email} onChange={handleChange} required type="email" placeholder="Your Email" className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all" />
              <textarea name="message" value={formData.message} onChange={handleChange} required rows="3" placeholder="Message" className="w-full p-4 bg-slate-50 rounded-lg border border-gray-200 outline-none focus:border-gold transition-all"></textarea>
              <button type="submit" disabled={status === 'loading'} className="w-full py-4 bg-oxford text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70">
                 {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle className="text-green-400" /> : <><Send size={18} /> Send Message</>}
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