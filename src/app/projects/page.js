"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, ExternalLink, Code, Loader2 } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

export default function AllProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const projSnap = await getDocs(collection(db, "projects"));
      setProjects(projSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-oxford dark:text-white font-sans">
      
      {/* Header */}
      <nav className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">All<span className="text-gold">Projects</span></h1>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-oxford dark:hover:text-white">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-oxford dark:text-white mb-4">My Complete Portfolio</h2>
          <p className="text-slate-500 dark:text-slate-400">A collection of my technical and financial projects.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin" /> Loading Projects...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div key={proj.id} className="bg-white dark:bg-slate-card p-6 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 hover:-translate-y-2 transition-all flex flex-col">
                {proj.imageUrl && <div className="w-full h-48 mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-900"><img src={proj.imageUrl} className="w-full h-full object-cover" /></div>}
                <h3 className="font-bold text-xl text-oxford dark:text-white mb-2">{proj.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3">{proj.desc}</p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-full">{proj.tech}</span>
                    {proj.link && <a href={proj.link} target="_blank" className="flex items-center gap-1 text-sm font-bold text-oxford dark:text-white hover:text-gold transition-colors">View <ExternalLink size={16} /></a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}