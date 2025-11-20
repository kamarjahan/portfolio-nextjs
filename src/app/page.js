"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, Send, Linkedin, Github, Instagram, Mail, 
  ExternalLink, Code, CheckCircle, Loader2, Award 
} from 'lucide-react';

import { db } from '../firebase'; 
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export default function Portfolio() {
  const [text, setText] = useState('');
  const fullText = "Finance Student. Tech Enthusiast. Future CA.";
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 100);

    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, "projects"));
      setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchProjects();

    return () => clearInterval(typing);
  }, []);

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
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-slate-light text-oxford overflow-x-hidden">
      
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-oxford">
            Kamar<span className="text-gold">Jahan</span>.in
          </h1>
          <a href="#contact" className="px-5 py-2 bg-oxford text-white rounded-full hover:bg-gold transition-all shadow-lg text-sm font-bold">
            Hire Me
          </a>
        </div>
      </nav>

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

      <section id="about" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-oxford">About Me</h2>
            <p className="text-slate-gray text-lg leading-loose">
              I am a dedicated student at <strong>NIOS Senior Secondary</strong> with a unique edge. 
              Unlike traditional finance students, I have deep technical expertise in <strong>Web Development</strong> and <strong>Microsoft Office</strong>.
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
          </div>
        </div>
      </section>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="py-24 bg-slate-light">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-oxford text-center mb-12">Featured Projects</h2>
          
          {projects.length === 0 ? (
             <div className="text-center text-slate-400">
                <p>Loading Projects from Admin Panel...</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:-translate-y-2 transition-all duration-300 flex flex-col">
                  
                  {/* IF IMAGE EXISTS, SHOW IT */}
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
          )}
        </div>
      </section>

      <section id="contact" className="py-24 bg-oxford text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
           <div>
              <h2 className="text-4xl font-bold mb-4">Let's Connect</h2>
              <p className="text-slate-400 mb-8">I am available for freelance web projects or finance internships.</p>
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